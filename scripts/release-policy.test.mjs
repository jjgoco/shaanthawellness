import { test } from 'node:test';
import assert from 'node:assert/strict';
import { releaseProblems } from './release-policy.mjs';
const digest = 'a'.repeat(64);
const approved = { visualApproved: true, legalApproved: true, publicationApproved: true, approvedAt: '2026-10-05T12:00:00Z', approvedSourceSha256: digest };
test('permits only a reviewed policy and exact source with all human approvals', () => {
  assert.deepEqual(releaseProblems(approved, '<h1>Privacy policy</h1><p>Confirmed owner details.</p>', digest), []);
});
test('a source change invalidates earlier approvals', () => {
  assert.ok(releaseProblems(approved, '<p>Final notice</p>', 'b'.repeat(64)).includes('approval of current source digest'));
});
test('each approval is required as a boolean', () => {
  for (const key of ['visualApproved','legalApproved','publicationApproved']) assert.ok(releaseProblems({ ...approved, [key]: 'true' }, '<p>Final notice</p>', digest).includes(key));
});
test('draft or unconfirmed owner fields block release despite checked approvals', () => {
  for (const text of ['[CONFIRM_CONTACT_ADDRESS]', 'Draft for owner review', 'awaiting owner confirmation']) assert.ok(releaseProblems(approved, text, digest).includes('privacy owner facts'));
});
test('missing or invalid review date blocks release', () => {
  for (const date of [null, '', 'unknown']) assert.ok(releaseProblems({ ...approved, approvedAt: date }, '<p>Final notice</p>', digest).includes('approval date'));
});
