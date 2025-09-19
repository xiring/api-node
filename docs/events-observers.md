# Domain Events & Observers

Lightweight event system using Node’s EventEmitter. Services emit domain events; observers react asynchronously.

## Event Bus
- `src/events/EventBus.js` extends EventEmitter and logs each emission
- Event names in `src/events/types.js`

## Built-in Events
- `auth.registered` — emitted after successful registration
- `auth.login` — emitted after successful login
- `order.created` — after order creation
- `order.updated` — after order update
- `shipment.created` — after shipment creation
- `shipment.updated` — after shipment update

## Observers
- Registered in `src/server.js`
- Implemented in `src/observers/`
  - `AuthObservers.js`: sends welcome email on registration
  - `OrderObservers.js`: sends order confirmation (when user is present)
  - `ShipmentObservers.js`: sends shipment notification on status updates

## Add a Custom Observer
```javascript
// src/observers/CustomObservers.js
module.exports = function registerCustom(eventBus) {
  eventBus.on('order.created', ({ order, user }) => {
    // custom side effects
  });
};
```

Register it in server bootstrap:
```javascript
// src/server.js
const EventBus = require('../events/EventBus');
const registerCustom = require('./observers/CustomObservers');
registerCustom(EventBus);
```

## Testing
- Unit tests assert service emissions: `src/tests/unit/events.emit.test.js`
- Observer tests assert EmailService calls: `src/tests/unit/observers.email.test.js`
