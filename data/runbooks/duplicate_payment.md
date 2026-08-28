# Duplicate Payment (E4015)

## Description
Duplicate payment occurs when the same transaction is processed multiple times, typically due to retry logic issues, user double-submission, or system processing errors.

## Common Causes
- User double-clicking payment button
- Retry logic without idempotency checks
- Network issues causing duplicate requests
- Payment gateway processing delays
- Browser back/refresh after submission
- API client retry without proper deduplication

## Symptoms
- Multiple transactions with same payment_id or similar amounts
- Same customer charged multiple times
- Payment status: `success` for duplicates
- Customer complaints about duplicate charges
- Reconciliation discrepancies

## Investigation Steps
1. Search for transactions with same customer and amount
2. Check timestamp proximity of suspected duplicates
- Review payment gateway transaction IDs
4. Analyze client-side submission logs
5. Check retry logic implementation
6. Verify idempotency key usage

## Evidence to Collect
- Transaction records with matching attributes
- Payment gateway transaction logs
- Client submission logs and timestamps
- API request/response logs
- Idempotency key usage records
- Customer complaint details

## Resolution Actions
### Immediate
- Identify and flag duplicate transactions
- Initiate refund for duplicate charges
- Contact affected customers proactively
- Disable problematic retry logic

### Short-term
- Implement idempotency checks
- Add client-side duplicate prevention
- Review and fix retry logic
- Add duplicate detection alerts

### Long-term
- Implement robust idempotency framework
- Add payment request deduplication middleware
- Implement reconciliation automation
- Add duplicate detection in monitoring

## Customer Communication
**Template:**
"We noticed that your payment was processed multiple times due to a technical issue. We have initiated a refund for the duplicate charge(s). You should see the refund reflected in your account within [X] business days. We apologize for the inconvenience."

## Escalation Criteria
- Multiple customers affected by duplicates
- High value duplicate transactions
- Duplicate rate > 1% of total transactions
- Recurring duplicate payment issues
- Regulatory or compliance implications

## Related Runbooks
- None (specific to duplicate handling)
