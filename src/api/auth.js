import { delay, loadJson } from './client';
import storage from '@/utils/storage';
import { STORAGE_KEYS } from '@/utils/constants';

/**
 * Credential check against public/data/users.json.
 *
 * This is deliberately a front-end-only demo: the file holds plain-text
 * passwords and is served to the browser, so anyone can read it. Never model a
 * real sign-in on this — see the README.
 */

const sanitise = ({ password, ...safe }) => safe;

export async function listUsers() {
  const users = await loadJson('users.json');
  return users.map(sanitise);
}

export async function login({ username, password }) {
  await delay(420);
  const users = await loadJson('users.json');
  const identifier = String(username ?? '').trim().toLowerCase();

  if (!identifier || !password) {
    throw new Error('Enter both a username and a password.');
  }

  const account = users.find(
    (user) =>
      user.username.toLowerCase() === identifier ||
      user.email.toLowerCase() === identifier,
  );

  if (!account) {
    throw new Error('No account matches that username.');
  }
  if (account.password !== password) {
    throw new Error('That password does not match our records.');
  }

  const session = {
    user: sanitise(account),
    issuedAt: new Date().toISOString(),
    token: `demo.${btoa(`${account.id}:${account.username}`)}`,
  };

  storage.write(STORAGE_KEYS.session, session);
  return session;
}

export function readSession() {
  const session = storage.read(STORAGE_KEYS.session);
  if (!session?.user?.id) return null;
  return session;
}

export function logout() {
  storage.remove(STORAGE_KEYS.session);
}

/** Profile edits live in the session only; the JSON file stays untouched. */
export async function updateProfile(patch) {
  await delay(260);
  const session = readSession();
  if (!session) throw new Error('You are not signed in.');
  const next = { ...session, user: { ...session.user, ...patch } };
  storage.write(STORAGE_KEYS.session, next);
  return next;
}
