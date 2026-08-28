# Fraud Decline (E1001)

## Description
Fraud decline occurs when a transaction is blocked by fraud detection systems due to suspicious activity patterns, risk score thresholds, or matching against known fraud indicators.

## Common Causes
- Unusual transaction amount for customer profile
- Transaction from unusual geographic location
- Multiple rapid transactions from same customer
- Mismatch between billing and shipping address
- Device fingerprint anomalies
- Known fraudulent patterns in transaction metadata

## Symptoms
- Payment status: `failed`
- Error code: `E1001`
- Fraud service logs showing risk score above threshold
- Specific fraud rule triggered

## Investigation Steps
1. Review customer's transaction history
2. Check fraud risk score and contributing factors
3. Verify customer identity through additional verification
4. Analyze transaction patterns for anomalies
5. Check if customer is on watchlist

## Evidence to Collect
- Fraud detection service logs
- Risk score breakdown and factors
- Customer historical transaction data
- Device fingerprint and IP information
- Transaction metadata and attributes

## Resolution Actions
### Immediate
- Request additional customer verification
- Offer alternative payment methods
- Provide clear explanation to customer

### Short-term
- Review fraud rule configuration
- Analyze false positive patterns
- Update customer risk profile if legitimate

### Long-term
- Implement machine learning for fraud detection
- Add behavioral biometrics
- Implement adaptive risk scoring
- Review and tune fraud thresholds

## Customer Communication
**Template:**
"For your security, this transaction was flagged for additional verification. Please verify your identity through [verification method] or contact our support team for assistance."

## Escalation Criteria
- High false positive rate (>5%)
- Legitimate customers repeatedly blocked
- Fraud rule causing business impact
- Customer complaints about false declines

## Related Runbooks
- None (specific to fraud detection)
