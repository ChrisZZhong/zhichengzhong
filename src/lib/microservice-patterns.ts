export interface MicroservicePattern {
  slug: string;
  name: string;
  diagram: readonly [string, string, string] | readonly [string, string, string, string];
  flow?: 'split' | 'join';
}

interface PatternGroup {
  id: string;
  name: string;
  question: string;
  patterns: readonly MicroservicePattern[];
}

export const patternCatalogHref = '/system-design-patterns';
export const patternSourceUrl = 'https://microservices.io/patterns/';
export const patternPostSlugPrefix = 'SystemDesign/2026-11-20-pattern-';

export const patternGroups: readonly PatternGroup[] = [
  {
    id: 'boundaries', name: 'Architecture and boundaries', question: 'What gets deployed together, and who owns it?',
    patterns: [
      {
        slug: 'monolithic-architecture', name: 'Monolithic architecture',
        diagram: ['Client', 'Booking application', 'Database'],
      },
      {
        slug: 'microservice-architecture', name: 'Microservice architecture',
        diagram: ['Client', 'API gateway', 'Reservations', 'Billing'], flow: 'split',
      },
      {
        slug: 'decompose-by-business-capability', name: 'Decompose by business capability',
        diagram: ['Rental platform', 'Capability map', 'Fleet availability', 'Billing'], flow: 'split',
      },
      {
        slug: 'decompose-by-subdomain', name: 'Decompose by subdomain',
        diagram: ['Shipping domain', 'Domain analysis', 'Scheduling model', 'Routing model'], flow: 'split',
      },
      {
        slug: 'self-contained-service', name: 'Self-contained service',
        diagram: ['Appointment request', 'Booking service', 'Local policy view'],
      },
      {
        slug: 'service-per-team', name: 'Service per team',
        diagram: ['Capacity team', 'Reservation service', 'Production feedback'],
      },
    ],
  },
  {
    id: 'migration', name: 'Migration and compatibility', question: 'How can an old system change while still serving traffic?',
    patterns: [
      {
        slug: 'strangler-application', name: 'Strangler application',
        diagram: ['Incoming requests', 'Routing seam', 'Legacy application', 'New capability'], flow: 'split',
      },
      {
        slug: 'anti-corruption-layer', name: 'Anti-corruption layer',
        diagram: ['Fulfilment model', 'Translation adapter', 'Legacy shipping API'],
      },
    ],
  },
  {
    id: 'data', name: 'Data ownership and consistency', question: 'Who owns a fact, and how can other services use it?',
    patterns: [
      {
        slug: 'database-per-service', name: 'Database per service',
        diagram: ['Billing service', 'Orders API', 'Orders-owned store'],
      },
      {
        slug: 'shared-database', name: 'Shared database',
        diagram: ['Reservations', 'Inventory', 'Shared database'], flow: 'join',
      },
      {
        slug: 'aggregate', name: 'Aggregate',
        diagram: ['Confirm command', 'Reservation root', 'Seat holds', 'Reservation status'], flow: 'split',
      },
      {
        slug: 'saga', name: 'Saga',
        diagram: ['Hold seat', 'Authorize payment', 'Confirm booking', 'Release hold'], flow: 'split',
      },
      {
        slug: 'command-side-replica', name: 'Command-side replica',
        diagram: ['Policy service', 'Capacity updates', 'Local policy view', 'Booking command'],
      },
      {
        slug: 'api-composition', name: 'API composition',
        diagram: ['Bookings API', 'Payments API', 'Summary composer'], flow: 'join',
      },
      {
        slug: 'cqrs', name: 'CQRS',
        diagram: ['Booking commands', 'Write model', 'Projection', 'Dashboard view'],
      },
      {
        slug: 'domain-event', name: 'Domain event',
        diagram: ['Reservation model', 'Confirmation event', 'Notifications', 'Reporting'], flow: 'split',
      },
      {
        slug: 'event-sourcing', name: 'Event sourcing',
        diagram: ['Accept command', 'Append events', 'Replay events', 'Current state'],
      },
    ],
  },
  {
    id: 'delivery', name: 'Reliable event delivery', question: 'How do state changes reach consumers through failures?',
    patterns: [
      {
        slug: 'transactional-outbox', name: 'Transactional outbox',
        diagram: ['Booking command', 'State + outbox commit', 'Message relay', 'Event broker'],
      },
      {
        slug: 'transaction-log-tailing', name: 'Transaction log tailing',
        diagram: ['Database commit', 'Change log', 'CDC connector', 'Event topic'],
      },
      {
        slug: 'polling-publisher', name: 'Polling publisher',
        diagram: ['Outbox rows', 'Lease a batch', 'Publish events', 'Mark complete'],
      },
      {
        slug: 'idempotent-consumer', name: 'Idempotent consumer',
        diagram: ['Incoming event', 'Check durable key', 'Apply once', 'Skip duplicate'], flow: 'split',
      },
    ],
  },
  {
    id: 'interfaces', name: 'APIs, messaging, and UI', question: 'How do clients and services exchange information?',
    patterns: [
      {
        slug: 'remote-procedure-invocation', name: 'Remote procedure invocation',
        diagram: ['Reservation service', 'Typed request', 'Capacity API'],
      },
      {
        slug: 'messaging', name: 'Messaging',
        diagram: ['Booking service', 'Event broker', 'Email worker', 'Analytics worker'], flow: 'split',
      },
      {
        slug: 'domain-specific-protocol', name: 'Domain-specific protocol',
        diagram: ['Notification worker', 'SMTP adapter', 'Mail gateway'],
      },
      {
        slug: 'api-gateway', name: 'API gateway',
        diagram: ['Public clients', 'Gateway', 'Catalog API', 'Reservation API'], flow: 'split',
      },
      {
        slug: 'backend-for-frontend', name: 'Backend for frontend',
        diagram: ['Mobile app', 'Mobile BFF', 'Booking API', 'Venue API'], flow: 'split',
      },
      {
        slug: 'server-side-page-fragment-composition', name: 'Server-side page fragment composition',
        diagram: ['Event fragment', 'Inventory fragment', 'Page renderer'], flow: 'join',
      },
      {
        slug: 'client-side-ui-composition', name: 'Client-side UI composition',
        diagram: ['Catalog module', 'Ticket module', 'Browser shell'], flow: 'join',
      },
    ],
  },
  {
    id: 'traffic', name: 'Traffic, reliability, and identity', question: 'How do calls find a healthy destination and carry trusted identity?',
    patterns: [
      {
        slug: 'client-side-discovery', name: 'Client-side discovery',
        diagram: ['Service registry', 'Client load balancer', 'Capacity instance'],
      },
      {
        slug: 'server-side-discovery', name: 'Server-side discovery',
        diagram: ['Booking client', 'Stable service address', 'Ready instance'],
      },
      {
        slug: 'service-registry', name: 'Service registry',
        diagram: ['Service instances', 'Endpoint registry', 'Router or client'],
      },
      {
        slug: 'self-registration', name: 'Self-registration',
        diagram: ['Ready instance', 'Register and renew', 'Service registry'],
      },
      {
        slug: 'third-party-registration', name: 'Third-party registration',
        diagram: ['Workload lifecycle', 'Platform registrar', 'Service registry'],
      },
      {
        slug: 'circuit-breaker', name: 'Circuit breaker',
        diagram: ['Closed: calls flow', 'Open: fail fast', 'Half-open: probe'],
      },
      {
        slug: 'access-token', name: 'Access token',
        diagram: ['Authorization server', 'Scoped token', 'Resource API'],
      },
    ],
  },
  {
    id: 'deployment', name: 'Deployment and runtime', question: 'What runs together, and what failure boundary does it share?',
    patterns: [
      {
        slug: 'multiple-services-per-host', name: 'Multiple service instances per host',
        diagram: ['Shared host', 'Process supervisor', 'Catalog process', 'Billing process'], flow: 'split',
      },
      {
        slug: 'single-service-per-host', name: 'Service instance per host',
        diagram: ['Encoder queue', 'Dedicated host', 'Encoder instance'],
      },
      {
        slug: 'service-per-vm', name: 'Service instance per VM',
        diagram: ['Versioned VM image', 'Guest OS', 'Billing instance'],
      },
      {
        slug: 'service-per-container', name: 'Service instance per container',
        diagram: ['Container image', 'Container runtime', 'Venue API replica'],
      },
      {
        slug: 'serverless-deployment', name: 'Serverless deployment',
        diagram: ['Object upload', 'Managed trigger', 'Resize function', 'Output store'],
      },
      {
        slug: 'service-deployment-platform', name: 'Service deployment platform',
        diagram: ['Desired state', 'Platform controller', 'Running replicas'],
      },
      {
        slug: 'sidecar', name: 'Sidecar',
        diagram: ['Workload pod', 'Local interface', 'Application', 'Sidecar collector'], flow: 'split',
      },
      {
        slug: 'service-mesh', name: 'Service mesh',
        diagram: ['Checkout service', 'Local data plane', 'Remote data plane', 'Billing service'],
      },
    ],
  },
  {
    id: 'service-standards', name: 'Shared service standards', question: 'Which choices should be consistent across services?',
    patterns: [
      {
        slug: 'microservice-chassis', name: 'Microservice chassis',
        diagram: ['Shared chassis', 'Service dependencies', 'Runtime defaults'],
      },
      {
        slug: 'externalized-configuration', name: 'Externalized configuration',
        diagram: ['Environment settings', 'Validated config', 'Service runtime'],
      },
      {
        slug: 'service-template', name: 'Service template',
        diagram: ['Approved scaffold', 'New service repository', 'First deployment'],
      },
    ],
  },
  {
    id: 'testing', name: 'Testing service boundaries', question: 'How do teams verify changes without running the whole system?',
    patterns: [
      {
        slug: 'consumer-driven-contract-test', name: 'Consumer-driven contract test',
        diagram: ['Consumer expectations', 'Versioned contract', 'Provider verification'],
      },
      {
        slug: 'consumer-side-contract-test', name: 'Consumer-side contract test',
        diagram: ['Consumer adapter', 'Verified stub', 'Client assertions'],
      },
      {
        slug: 'service-component-test', name: 'Service component test',
        diagram: ['Test request', 'Service under test', 'Test database', 'Payment double'], flow: 'split',
      },
    ],
  },
  {
    id: 'observability', name: 'Observability and operations', question: 'What evidence explains a failure or change in production?',
    patterns: [
      {
        slug: 'log-aggregation', name: 'Log aggregation',
        diagram: ['Reservation logs', 'Payment logs', 'Central log search'], flow: 'join',
      },
      {
        slug: 'application-metrics', name: 'Application metrics',
        diagram: ['Service signals', 'Metric aggregation', 'Dashboard and alerts'],
      },
      {
        slug: 'audit-logging', name: 'Audit logging',
        diagram: ['Administrative action', 'Audit record', 'Restricted audit store'],
      },
      {
        slug: 'distributed-tracing', name: 'Distributed tracing',
        diagram: ['Gateway span', 'Reservation span', 'Payment span', 'Trace viewer'],
      },
      {
        slug: 'exception-tracking', name: 'Exception tracking',
        diagram: ['Runtime exception', 'Group signatures', 'Issue and owner'],
      },
      {
        slug: 'health-check-api', name: 'Health check API',
        diagram: ['Platform probe', 'Service health API', 'Ready for traffic', 'Restart if unhealthy'], flow: 'split',
      },
      {
        slug: 'log-deployments-and-changes', name: 'Log deployments and changes',
        diagram: ['Deploy or config change', 'Change event', 'Incident timeline'],
      },
    ],
  },
];

export const microservicePatterns = patternGroups.flatMap(group => group.patterns);

export function getMicroservicePattern(slug: string) {
  const group = patternGroups.find(item => item.patterns.some(pattern => pattern.slug === slug));
  const pattern = group?.patterns.find(item => item.slug === slug);
  return group && pattern ? { group, pattern } : undefined;
}

export function getPatternHref(slug: string) {
  return `/blog/${patternPostSlugPrefix}${slug}`;
}

export function getPatternDiagramHref(slug: string) {
  return `${patternCatalogHref}/${slug}/diagram`;
}
