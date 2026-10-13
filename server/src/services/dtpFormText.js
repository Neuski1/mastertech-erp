// Default Direction to Pay wording, one paragraph per line. No requires on
// purpose: settingsCatalog.js loads this, and the catalog must not pull in
// the settings cache it feeds. Owner-editable as Business Setting wo_dtp_terms.
module.exports = [
  'I, {customer}, am the owner or insured of the {unit} (VIN {vin}), which is being repaired by Master Tech RV Repair & Storage under Work Order #{wo}.',
  'I direct {insurer} to issue all payment for the repair of this unit under Claim #{claim} payable to Master Tech RV Repair & Storage only, and to send it directly to Master Tech RV Repair & Storage, {address}. ACH preferred.',
  'This direction covers the repair estimate and any supplements for this loss. It is a direction to pay only. It does not assign my insurance policy or any other benefits under it.',
  'I remain responsible for my deductible, any amount my insurer does not pay, and any work I approve that the claim does not cover.',
  'If my insurer sends any payment for these repairs to me, I will endorse it or pay it over to Master Tech RV Repair & Storage within three (3) business days of receiving it.',
  'This direction stays in effect until the repairs are paid in full. A copy or electronic copy of this signed form is as valid as the original.',
].join('\n');
