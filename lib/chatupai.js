// lib/chatupai.js
import axios from 'axios';
import crypto from 'crypto';
import FormData from 'form-data';
import fs from 'fs';

const chatUpAI = {
  api: {
    base: 'https://api.chatupai.org',
    endpoints: {
      completions: '/api/v1/completions',
      image: '/api/v1/auto-image-generate',
      browsing: '/api/v1/web-browsing',
      pdf2Text: '/api/v1/pdf-to-text'
    }
  },

  headers: {
    'User-Agent': 'Postity/1.0.0'
  },

  sessions: new Map(),

  generateId: () => crypto.randomBytes(8).toString('hex'),

  config: {
    maxMessages: 100,
    expiry: 3 * 60 * 60 * 1000
  },

  cleanupSessions() {
    const now = Date.now();
    for (const [id, session] of this.sessions) {
      if (now - session.lastActive > this.config.expiry) {
        this.sessions.delete(id);
      }
    }
  },

  async chat(input, sessionId = null) {
    if (typeof input !== 'string' || !input.trim()) {
      return { success: false, code: 400, result: { error: "Inputnya kagak boleh kosong yak bree.." } };
    }

    if (sessionId && !this.sessions.has(sessionId)) {
      return { success: false, code: 400, result: { error: "Session expired, buat session baru yak..." } };
    }

    try {
      if (!sessionId) sessionId = this.generateId();

      const preMsg = this.sessions.get(sessionId)?.messages || [];
      const messages = [...preMsg, { role: "user", content: input }];

      const response = await axios.post(
        `${this.api.base}${this.api.endpoints.completions}`,
        { messages },
        { headers: this.headers }
      );

      const content = response.data?.data?.content || "Maaf, saya tidak dapat menjawab...";
      const asm = { role: "assistant", content, timestamp: Date.now() };
      const ups = [...messages, asm];

      this.sessions.set(sessionId, {
        messages: ups.slice(-this.config.maxMessages),
        lastActive: Date.now()
      });

      this.cleanupSessions();

      return {
        success: true,
        code: 200,
        result: asm.content,
        sessionId,
        sessionExpiry: new Date(Date.now() + this.config.expiry).toISOString(),
        messageCount: {
          current: ups.length,
          max: this.config.maxMessages
        },
        isNewSession: preMsg.length === 0,
        isFollowUp: preMsg.length > 0
      };

    } catch (err) {
      return {
        success: false,
        code: err.response?.status || 500,
        result: { error: err.message }
      };
    }
  },

  async generateImage(prompt, n = 1, size = '1024x1024') {
    if (typeof prompt !== 'string' || !prompt.trim()) {
      return { success: false, code: 400, result: { error: "Promptnya kagak kosong yak bree.." } };
    }

    try {
      const response = await axios.post(
        `${this.api.base}${this.api.endpoints.image}`,
        { prompt, n, size },
        { headers: this.headers }
      );

      if (!response.data.status || !response.data.data?.url) {
        return { success: false, code: 500, result: { error: "Error bree... 🗿" } };
      }

      return {
        success: true,
        code: 200,
        content: response.data.data.content,
        imageUrl: response.data.data.url
      };

    } catch (err) {
      return {
        success: false,
        code: err.response?.status || 500,
        result: { error: err.message }
      };
    }
  },

  async browsing(input) {
    if (typeof input !== 'string' || !input.trim()) {
      return { success: false, code: 400, result: { error: "Input web browsingnya kagak boleh kosong yak bree..." } };
    }

    try {
      const messages = [{ role: "user", content: input }];

      const response = await axios.post(
        `${this.api.base}${this.api.endpoints.browsing}`,
        { messages },
        { headers: this.headers }
      );

      const choices = response.data?.choices || {};
      const suggestions = response.data?.suggestion || [];

      return {
        success: true,
        code: 200,
        description: choices.Description || '',
        image: choices["Img-Prompt"] || '',
        urls: choices.Urls || [],
        suggestions
      };

    } catch (err) {
      return {
        success: false,
        code: err.response?.status || 500,
        result: { error: err.message }
      };
    }
  },

  async pdf2Text(filePath) {
    if (!filePath) {
      return { success: false, error: 'File pathnya kagak boleh kosong yak bree..' };
    }

    try {
      const form = new FormData();
      form.append('pdf', fs.createReadStream(filePath), {
        filename: filePath.split('/').pop(),
        contentType: 'application/pdf'
      });

      const response = await axios.post(
        `${this.api.base}${this.api.endpoints.pdf2Text}`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            ...this.headers
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      if (response.data?.status) {
        return { success: true, data: response.data.data };
      } else {
        return { success: false, error: 'Gagal extract PDF bree...' };
      }

    } catch (err) {
      return { success: false, error: err.message || 'Error bree... 🗿' };
    }
  }
};

export { chatUpAI };
