export function releaseProblems(status, privacyHtml, currentDigest) {
  const missing = ['visualApproved', 'legalApproved', 'publicationApproved'].filter(key => status[key] !== true);
  if (/CONFIRM_|Draft for owner review|awaiting owner confirmation/i.test(privacyHtml)) missing.push('privacy owner facts');
  if (!status.approvedAt || Number.isNaN(Date.parse(status.approvedAt))) missing.push('approval date');
  if (status.approvedSourceSha256 !== currentDigest) missing.push('approval of current source digest');
  return missing;
}
