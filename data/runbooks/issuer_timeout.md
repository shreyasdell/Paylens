# Issuer Timeout (E2012)

## Description
Issuer timeout occurs when the payment request to the issuing bank exceeds the configured timeout threshold, typically due to slow response times or unavailability of the issuer's systems.

## Common Causes
- High load on issuer's payment processing systems
- Network connectivity issues between payment gateway and issuer
- Issuer scheduled maintenance or downtime
- DNS resolution issues
- Firewall or security appliance blocking requests

## Symptoms
- Payment status: `timeout`
- Error code: `E2012`
- Elevated latency metrics for specific issuer
- Increased timeout rate in metrics dashboard

## Investigation Steps
1. Check current issuer status page for reported outages
2. Review network connectivity traces to issuer
3. Analyze latency trends for the affected issuer
4. Check if timeout rate is elevated across multiple merchants
5. Review recent changes to issuer integration

## Evidence to Collect
- Transaction logs showing timeout errors
- Network traces and latency metrics
- Issuer API response times
- Error logs from payment gateway
- Historical timeout patterns for this issuer

## Resolution Actions
### Immediate
- Implement retry logic with exponential backoff
- Increase timeout threshold temporarily (if SLA allows)
- Route traffic to backup payment rails if available

### Short-term
- Contact issuer technical support
- Monitor issuer status updates
- Implement circuit breaker pattern for failing issuer

### Long-term
- Review timeout configuration with issuer
- Implement multi-issuer routing
- Add issuer health monitoring
- Consider alternative payment methods for affected region

## Customer Communication
**Template:**
"We're currently experiencing technical difficulties with [Issuer Name] that may be affecting your payment. Please try again in a few minutes. If the issue persists, please contact our support team."

## Escalation Criteria
- Timeout rate > 10% for 5+ minutes
- Multiple issuers affected simultaneously
- Timeout rate > 25% for any single issuer
- Customer complaints increasing

## Related Runbooks
- Network Failure (E3011)
- Bank Unavailable (E5003)
