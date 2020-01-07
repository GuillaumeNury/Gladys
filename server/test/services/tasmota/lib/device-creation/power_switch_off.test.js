const sinon = require('sinon');
const { expect } = require('chai');

const { fake, assert } = sinon;
const TasmotaHandler = require('../../../../../services/tasmota/lib');
const { DEVICE_FEATURE_CATEGORIES, DEVICE_FEATURE_TYPES, EVENTS } = require('../../../../../utils/constants');

const messages = require('./power_switch_off.json');

const mqttService = {
  device: {
    publish: fake.returns(null),
  },
};
const gladys = {
  event: {
    emit: fake.resolves(null),
  },
};
const serviceId = 'service-uuid-random';

describe('TasmotaHandler - create device with switch POWER OFF feature', () => {
  const tasmotaHandler = new TasmotaHandler(gladys, serviceId);

  beforeEach(() => {
    tasmotaHandler.mqttService = mqttService;
    sinon.reset();
  });

  it('decode STATUS message', () => {
    tasmotaHandler.handleMqttMessage('stat/tasmota-device-topic/STATUS', JSON.stringify(messages.STATUS));

    expect(tasmotaHandler.mqttDevices).to.deep.eq({});
    expect(tasmotaHandler.pendingMqttDevices).to.deep.eq({
      'tasmota-device-topic': {
        name: 'Tasmota',
        model: 1,
        external_id: 'tasmota:tasmota-device-topic',
        selector: 'tasmota-tasmota-device-topic',
        service_id: serviceId,
        should_poll: false,
        features: [],
      },
    });

    assert.notCalled(gladys.event.emit);
    assert.calledWith(mqttService.device.publish, 'cmnd/tasmota-device-topic/STATUS', '11');
  });

  it('decode STATUS11 message', () => {
    tasmotaHandler.handleMqttMessage('stat/tasmota-device-topic/STATUS11', JSON.stringify(messages.STATUS11));

    expect(tasmotaHandler.mqttDevices).to.deep.eq({});
    expect(tasmotaHandler.pendingMqttDevices).to.deep.eq({
      'tasmota-device-topic': {
        name: 'Tasmota',
        model: 1,
        external_id: 'tasmota:tasmota-device-topic',
        selector: 'tasmota-tasmota-device-topic',
        service_id: serviceId,
        should_poll: false,
        features: [
          {
            category: DEVICE_FEATURE_CATEGORIES.SWITCH,
            type: DEVICE_FEATURE_TYPES.SWITCH.BINARY,
            external_id: 'tasmota:tasmota-device-topic:POWER',
            selector: 'tasmota-tasmota-device-topic-power',
            name: 'Switch',
            read_only: false,
            has_feedback: true,
            min: 0,
            max: 1,
            last_value: 0,
          },
        ],
      },
    });

    assert.calledWith(gladys.event.emit, EVENTS.DEVICE.NEW_STATE, {
      device_feature_external_id: 'tasmota:tasmota-device-topic:POWER',
      state: 0,
    });
    assert.calledWith(mqttService.device.publish, 'cmnd/tasmota-device-topic/STATUS', '8');
  });

  it('decode STATUS8 message', () => {
    tasmotaHandler.handleMqttMessage('stat/tasmota-device-topic/STATUS8', JSON.stringify(messages.STATUS8));

    expect(tasmotaHandler.mqttDevices).to.deep.eq({
      'tasmota-device-topic': {
        name: 'Tasmota',
        model: 1,
        external_id: 'tasmota:tasmota-device-topic',
        selector: 'tasmota-tasmota-device-topic',
        service_id: serviceId,
        should_poll: false,
        features: [
          {
            category: DEVICE_FEATURE_CATEGORIES.SWITCH,
            type: DEVICE_FEATURE_TYPES.SWITCH.BINARY,
            external_id: 'tasmota:tasmota-device-topic:POWER',
            selector: 'tasmota-tasmota-device-topic-power',
            name: 'Switch',
            read_only: false,
            has_feedback: true,
            min: 0,
            max: 1,
            last_value: 0,
          },
        ],
      },
    });
    expect(tasmotaHandler.pendingMqttDevices).to.deep.eq({});

    assert.notCalled(gladys.event.emit);
    assert.notCalled(mqttService.device.publish);
  });
});