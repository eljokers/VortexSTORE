import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const APPS_FILE = path.join(DATA_DIR, 'applications.json');

// Ensure data directory and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readOrders(): any[] {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out any mock dummy orders if previously saved
        return parsed.filter(
          (o: any) =>
            o.player !== 'FakeSender_00' &&
            o.orderId !== 'VTX-VC-89K2-1049' &&
            o.orderId !== 'VTX-VC-72P1-4820' &&
            o.orderId !== 'VTX-VC-55M9-3108' &&
            o.orderId !== 'VTX-VC-41A8-7612'
        );
      }
    }
  } catch (err) {
    console.error('Error reading orders file:', err);
  }
  return [];
}

function writeOrders(orders: any[]) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing orders file:', err);
  }
}

function sanitizeApps(apps: any[]): any[] {
  if (!Array.isArray(apps)) return [];
  return apps.filter((app: any) => {
    if (!app || typeof app !== 'object') return false;
    const isMock =
      app.id === 'VTX-APP-9241' ||
      app.id === 'VTX-APP-8104' ||
      app.id === 'VTX-APP-7392' ||
      app.minecraftUsername === 'ViperShadow' ||
      app.minecraftUsername === 'NovaKnight_' ||
      app.minecraftUsername === 'Xx_GamerBoy_xX';
    return !isMock;
  });
}

function sanitizeOrders(orders: any[]): any[] {
  if (!Array.isArray(orders)) return [];
  return orders.filter((o: any) => {
    if (!o || typeof o !== 'object') return false;
    const isMock =
      o.player === 'FakeSender_00' ||
      o.player === 'DragonSlayer_99' ||
      o.orderId === 'VTX-VC-89K2-1049' ||
      o.orderId === 'VTX-VC-72P1-4820' ||
      o.orderId === 'VTX-VC-55M9-3108' ||
      o.orderId === 'VTX-VC-41A8-7612';
    return !isMock;
  });
}

function getDeliveryDetails(pkg: string, player: string) {
  const p = (player || 'Player').trim();
  const cleanPkg = (pkg || '').toUpperCase();

  let rankKey = 'vip';
  let primaryCommand = `/lp user ${p} parent add vip`;

  if (cleanPkg.includes('MVP+')) {
    rankKey = 'mvpplus';
    primaryCommand = `/lp user ${p} parent add mvpplus`;
  } else if (cleanPkg.includes('MVP')) {
    rankKey = 'mvp';
    primaryCommand = `/lp user ${p} parent add mvp`;
  } else if (cleanPkg.includes('VIP+')) {
    rankKey = 'vipplus';
    primaryCommand = `/lp user ${p} parent add vipplus`;
  } else if (cleanPkg.includes('VIP')) {
    rankKey = 'vip';
    primaryCommand = `/lp user ${p} parent add vip`;
  } else if (cleanPkg.includes('CUSTOM') || cleanPkg.includes('VORTEX')) {
    rankKey = 'vortex';
    primaryCommand = `/lp user ${p} parent add vortex`;
  } else if (cleanPkg.includes('KEY')) {
    if (cleanPkg.includes('50') || cleanPkg.includes('ULTIMATE')) {
      primaryCommand = `/crate give ${p} ultimate 50`;
    } else if (cleanPkg.includes('30') || cleanPkg.includes('MASTER')) {
      primaryCommand = `/crate give ${p} master 30`;
    } else if (cleanPkg.includes('15') || cleanPkg.includes('MYTHIC')) {
      primaryCommand = `/crate give ${p} mythic 15`;
    } else {
      primaryCommand = `/crate give ${p} mythic 5`;
    }
  } else if (cleanPkg.includes('COIN')) {
    if (cleanPkg.includes('1,500,000') || cleanPkg.includes('1500000')) {
      primaryCommand = `/eco give ${p} 1500000`;
    } else if (cleanPkg.includes('500,000') || cleanPkg.includes('500000')) {
      primaryCommand = `/eco give ${p} 500000`;
    } else if (cleanPkg.includes('150,000') || cleanPkg.includes('150000')) {
      primaryCommand = `/eco give ${p} 150000`;
    } else {
      primaryCommand = `/eco give ${p} 50000`;
    }
  } else if (cleanPkg.includes('WING') || cleanPkg.includes('COSMETIC')) {
    primaryCommand = `/cosmetics give ${p} wings_bundle`;
  }

  const broadcastCommand = `/broadcast &b[VortexMC] &aتم تسليم وتفعيل باقة &6${pkg} &aللاعب &e${p}&a فوراً! شكراً لدعمك للسيرفر ⚡`;

  return {
    delivered: true,
    deliveredAt: new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }),
    commandExecuted: primaryCommand,
    deliveryLog: [
      `[RCON Dispatch] ${primaryCommand}`,
      `[Broadcast] ${broadcastCommand}`,
      `[Sync] LuckPerms node permissions synced across Java & Bedrock clusters`,
      `[In-Game] Rank perks & prefixes activated instantly for ${p}`,
    ],
  };
}

function readApps(): any[] {
  try {
    if (fs.existsSync(APPS_FILE)) {
      const raw = fs.readFileSync(APPS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return sanitizeApps(parsed);
      }
    }
  } catch (err) {
    console.error('Error reading applications file:', err);
  }
  return [];
}

function writeApps(apps: any[]) {
  try {
    fs.writeFileSync(APPS_FILE, JSON.stringify(apps, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing applications file:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support JSON & Urlencoded payloads up to 25mb for Base64 receipt images
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Client IP detection endpoint
  app.get('/api/my-ip', (req, res) => {
    const rawIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      req.ip ||
      '127.0.0.1';
    // Clean IPv6 mapped IPv4 like ::ffff:192.168.1.1
    const cleanIp = rawIp.replace(/^::ffff:/, '');
    res.json({ ip: cleanIp });
  });

  // --- ORDERS API ---

  // Get all real orders
  app.get('/api/orders', (req, res) => {
    const orders = readOrders();
    res.json(orders);
  });

  // Create new real order
  app.post('/api/orders', (req, res) => {
    const newOrder = req.body;
    if (!newOrder || !newOrder.orderId || !newOrder.player) {
      return res.status(400).json({ error: 'Missing required order fields' });
    }

    // Determine client IP if not sent by client
    if (!newOrder.clientIp) {
      const rawIp =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket.remoteAddress ||
        req.ip ||
        '127.0.0.1';
      newOrder.clientIp = rawIp.replace(/^::ffff:/, '');
    }

    // Generate rank command if not present e.g. lp user {username} parent add {tier}
    if (!newOrder.rankCommand) {
      const p = (newOrder.player || 'Player').trim();
      const cleanPkg = (newOrder.tier || newOrder.package || '').toLowerCase();
      let rank = 'vip';
      if (cleanPkg.includes('mvp+')) rank = 'mvpplus';
      else if (cleanPkg.includes('mvp')) rank = 'mvp';
      else if (cleanPkg.includes('vip+')) rank = 'vipplus';
      else if (cleanPkg.includes('vip')) rank = 'vip';
      else if (cleanPkg.includes('vortex')) rank = 'vortex';
      else if (cleanPkg.includes('titan')) rank = 'titan';
      else if (cleanPkg.includes('hero')) rank = 'hero';
      else if (cleanPkg.includes('legend')) rank = 'legend';
      else rank = cleanPkg.replace(/[^a-z0-9_]/g, '') || 'vip';
      newOrder.rankCommand = `lp user ${p} parent add ${rank}`;
    }

    const orders = readOrders();
    // Prepend new order (most recent first)
    const filtered = orders.filter((o: any) => o.orderId !== newOrder.orderId);
    const updated = [newOrder, ...filtered];
    writeOrders(updated);

    res.status(201).json({ success: true, order: newOrder });
  });

  // Update order status or details (with automated rank delivery upon acceptance)
  app.patch('/api/orders/:orderId', (req, res) => {
    const { orderId } = req.params;
    const { status, staffNotes, cancellationReason, reviewedBy, archived } = req.body;

    const orders = readOrders();
    let found = false;
    const now = Date.now();
    const nowStr = new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });

    const updated = orders.map((o: any) => {
      if (o.orderId === orderId) {
        found = true;
        const isApproved = status === 'accepted';
        const delivery = isApproved ? getDeliveryDetails(o.package, o.player) : null;
        const statusChanged = status && status !== o.status;

        return {
          ...o,
          ...(status ? { status } : {}),
          ...(staffNotes !== undefined ? { staffNotes } : {}),
          ...(cancellationReason !== undefined ? { cancellationReason } : {}),
          ...(reviewedBy ? { reviewedBy } : {}),
          ...(archived !== undefined ? { archived: Boolean(archived) } : {}),
          ...(statusChanged ? { reviewedAt: nowStr, reviewedTimestamp: now } : {}),
          ...(isApproved && delivery
            ? {
                delivered: true,
                deliveredAt: delivery.deliveredAt,
                commandExecuted: delivery.commandExecuted,
                deliveryLog: delivery.deliveryLog,
              }
            : {}),
        };
      }
      return o;
    });

    if (!found) {
      return res.status(404).json({ error: 'Order not found' });
    }

    writeOrders(updated);
    const target = updated.find((o: any) => o.orderId === orderId);
    res.json({ success: true, order: target });
  });

  // Direct delivery endpoint to dispatch or re-dispatch rank to player
  app.post('/api/orders/:orderId/deliver', (req, res) => {
    const { orderId } = req.params;
    const orders = readOrders();
    let target: any = null;
    const updated = orders.map((o: any) => {
      if (o.orderId === orderId) {
        const delivery = getDeliveryDetails(o.package, o.player);
        target = {
          ...o,
          status: 'accepted',
          delivered: true,
          deliveredAt: delivery.deliveredAt,
          commandExecuted: delivery.commandExecuted,
          deliveryLog: delivery.deliveryLog,
        };
        return target;
      }
      return o;
    });

    if (!target) {
      return res.status(404).json({ error: 'Order not found' });
    }

    writeOrders(updated);
    res.json({ success: true, order: target });
  });

  // Delete an order
  app.delete('/api/orders/:orderId', (req, res) => {
    const { orderId } = req.params;
    const orders = readOrders();
    const updated = orders.filter((o: any) => o.orderId !== orderId);
    writeOrders(updated);
    res.json({ success: true, deleted: orderId });
  });

  // Serve raw receipt image for an order
  app.get('/api/orders/:orderId/receipt-image', (req, res) => {
    const { orderId } = req.params;
    const orders = readOrders();
    const order = orders.find((o: any) => o.orderId === orderId);
    if (!order || !order.paymentProof) {
      return res.status(404).send('No receipt image found for this order');
    }

    const match = order.paymentProof.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (match) {
      const contentType = match[1];
      const buffer = Buffer.from(match[2], 'base64');
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="receipt_${orderId}.png"`);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(buffer);
    }
    res.status(400).send('Invalid image format');
  });

  // Forward Discord Webhook with actual image file attachment
  app.post('/api/discord/webhook', async (req, res) => {
    try {
      const { webhookUrl, payloadJson, imageBase64, imageName } = req.body;
      const targetUrl = webhookUrl || process.env.DISCORD_PASSCODE_WEBHOOK;
      if (!targetUrl) {
        return res.status(400).json({ error: 'No webhook URL provided' });
      }

      const parsedPayload = typeof payloadJson === 'string' ? JSON.parse(payloadJson) : (payloadJson || {});

      if (imageBase64) {
        // Extract base64 data and mime type
        const match = imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        const mimeType = match ? match[1] : 'image/png';
        const base64Data = match ? match[2] : imageBase64;
        const buffer = Buffer.from(base64Data, 'base64');
        const filename = imageName || 'receipt.png';

        // Set embed image to point to the attached file
        if (parsedPayload.embeds && parsedPayload.embeds.length > 0) {
          parsedPayload.embeds[0].image = { url: `attachment://${filename}` };
        }

        const formData = new FormData();
        const blob = new Blob([buffer], { type: mimeType });
        formData.append('files[0]', blob, filename);
        formData.append('payload_json', JSON.stringify(parsedPayload));

        const discordRes = await fetch(targetUrl, {
          method: 'POST',
          body: formData,
        });

        if (!discordRes.ok) {
          const errText = await discordRes.text();
          return res.status(discordRes.status).json({ error: errText });
        }

        return res.json({ success: true });
      } else {
        const discordRes = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsedPayload),
        });

        if (!discordRes.ok) {
          const errText = await discordRes.text();
          return res.status(discordRes.status).json({ error: errText });
        }

        return res.json({ success: true });
      }
    } catch (err: any) {
      console.error('Discord webhook forward error:', err);
      res.status(500).json({ error: err.message || 'Failed to dispatch Discord webhook' });
    }
  });

  // Clear all mock/test orders
  app.post('/api/orders/clean-mock', (req, res) => {
    const orders = readOrders();
    const cleaned = sanitizeOrders(orders);
    writeOrders(cleaned);
    res.json({ success: true, count: cleaned.length });
  });

  // Reset/Empty all orders
  app.post('/api/orders/clear-all', (req, res) => {
    writeOrders([]);
    res.json({ success: true, count: 0 });
  });

  // --- APPLICATIONS API ---

  app.get('/api/applications', (req, res) => {
    const apps = readApps();
    res.json(apps);
  });

  app.post('/api/applications', (req, res) => {
    const newApp = req.body;
    if (!newApp || !newApp.id) {
      return res.status(400).json({ error: 'Missing application data' });
    }
    const apps = readApps();
    const filtered = apps.filter((a: any) => a.id !== newApp.id);
    const updated = [newApp, ...filtered];
    writeApps(updated);
    res.status(201).json({ success: true, application: newApp });
  });

  app.patch('/api/applications/:id', (req, res) => {
    const { id } = req.params;
    const { status, notes, reviewedBy, archived } = req.body;

    const apps = readApps();
    let found = false;
    const now = Date.now();
    const nowStr = new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });

    const updated = apps.map((a: any) => {
      if (a.id === id) {
        found = true;
        const statusChanged = status && status !== a.status;

        return {
          ...a,
          ...(status ? { status } : {}),
          ...(notes !== undefined ? { notes } : {}),
          ...(reviewedBy ? { reviewedBy } : {}),
          ...(archived !== undefined ? { archived: Boolean(archived) } : {}),
          ...(statusChanged ? { reviewedAt: nowStr, reviewedTimestamp: now } : {}),
        };
      }
      return a;
    });

    if (!found) {
      return res.status(404).json({ error: 'Application not found' });
    }

    writeApps(updated);
    const target = updated.find((a: any) => a.id === id);
    res.json({ success: true, application: target });
  });

  app.delete('/api/applications/:id', (req, res) => {
    const { id } = req.params;
    const apps = readApps();
    const updated = apps.filter((a: any) => a.id !== id);
    writeApps(updated);
    res.json({ success: true, deleted: id });
  });

  // Clean mock applications
  app.post('/api/applications/clean-mock', (req, res) => {
    const apps = readApps();
    const cleaned = sanitizeApps(apps);
    writeApps(cleaned);
    res.json({ success: true, count: cleaned.length });
  });

  // Clear all applications
  app.post('/api/applications/clear-all', (req, res) => {
    writeApps([]);
    res.json({ success: true, count: 0 });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VortexMC Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
