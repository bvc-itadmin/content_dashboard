'use strict';
/**
 * Sign-in cookie. It holds who the person is and when it expires, signed with SESSION_SECRET so
 * nobody can change it. The website is still the authority: it re-checks the person's role on
 * every action, so removing a login stops working at once even if the cookie is still valid.
 */
const crypto = require('crypto');

const COOKIE = 'bvc_session';

function secret() {
  const s = process.env.SESSION_SECRET || '';
  if (s.length < 32) throw new Error('SESSION_SECRET is not set (needs 32+ characters).');
  return s;
}

const b64 = (buf) => Buffer.from(buf).toString('base64url');
const hmac = (data) => crypto.createHmac('sha256', secret()).update(data).digest('base64url');

function sign(payload) {
  const body = b64(JSON.stringify(payload));
  return body + '.' + hmac(body);
}

function verify(token) {
  if (!token || token.indexOf('.') < 1) return null;
  const [body, sig] = token.split('.');
  const good = hmac(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(good);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch (e) {
    return null;
  }
}

function readCookie(req, name) {
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return '';
}

function isSecure(req) {
  return (req.headers['x-forwarded-proto'] || '').split(',')[0] === 'https';
}

function getSession(req) {
  return verify(readCookie(req, COOKIE));
}

function setSession(req, res, user, remember) {
  const age = remember ? 30 * 24 * 3600 : 12 * 3600;
  const token = sign({ uid: user.id, name: user.name, email: user.email, role: user.role, exp: Math.floor(Date.now() / 1000) + age });
  const flags = ['HttpOnly', 'Path=/', 'SameSite=Lax', 'Max-Age=' + age];
  if (isSecure(req)) flags.push('Secure');
  res.setHeader('Set-Cookie', COOKIE + '=' + token + '; ' + flags.join('; '));
}

function clearSession(req, res) {
  const flags = ['HttpOnly', 'Path=/', 'SameSite=Lax', 'Max-Age=0'];
  if (isSecure(req)) flags.push('Secure');
  res.setHeader('Set-Cookie', COOKIE + '=; ' + flags.join('; '));
}

module.exports = { getSession, setSession, clearSession };
