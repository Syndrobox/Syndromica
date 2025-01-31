/* eslint-disable camelcase */
import nconf from 'nconf';
import Amplitude from 'amplitude';
import { Visitor } from 'universal-analytics';
import * as analyticsService from '../../../../website/server/libs/analyticsService';

describe('analyticsService', () => {
  beforeEach(() => {
    sandbox.stub(Amplitude.prototype, 'track').returns(Promise.resolve());

    sandbox.stub(Visitor.prototype, 'event');
    sandbox.stub(Visitor.prototype, 'transaction');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#getServiceByEnvironment', () => {
    it('returns mock methods when not in production', () => {
      sandbox.stub(nconf, 'get').withArgs('IS_PROD').returns(false);
      expect(analyticsService.getAnalyticsServiceByEnvironment())
        .to.equal(analyticsService.mockAnalyticsService);
    });

    it('returns real methods when in production', () => {
      sandbox.stub(nconf, 'get').withArgs('IS_PROD').returns(true);
      expect(analyticsService.getAnalyticsServiceByEnvironment().track)
        .to.equal(analyticsService.track);
      expect(analyticsService.getAnalyticsServiceByEnvironment().trackPurchase)
        .to.equal(analyticsService.trackPurchase);
    });
  });

  describe('#track', () => {
    let eventType; let
      data;

    beforeEach(() => {
      Visitor.prototype.event.yields();

      eventType = 'Cron';
      data = {
        category: 'behavior',
        uuid: 'unique-user-id',
        resting: true,
        cronCount: 5,
        headers: {
          'x-client': 'syndromica-web',
          'user-agent': '',
        },
      };
    });

    context('Amplitude', () => {
      it('calls out to amplitude', () => analyticsService.track(eventType, data)
        .then(() => {
          expect(Amplitude.prototype.track).to.be.calledOnce;
        }));

      it('uses a dummy user id if none is provided', () => {
        delete data.uuid;

        return analyticsService.track(eventType, data)
          .then(() => {
            expect(Amplitude.prototype.track).to.be.calledWithMatch({
              user_id: 'no-user-id-was-provided',
            });
          });
      });

      context('platform', () => {
        it('logs web platform', () => {
          data.headers = { 'x-client': 'syndromica-web' };

          return analyticsService.track(eventType, data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                platform: 'Web',
              });
            });
        });

        it('logs iOS platform', () => {
          data.headers = { 'x-client': 'syndromica-ios' };

          return analyticsService.track(eventType, data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                platform: 'iOS',
              });
            });
        });

        it('logs Android platform', () => {
          data.headers = { 'x-client': 'syndromica-android' };

          return analyticsService.track(eventType, data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                platform: 'Android',
              });
            });
        });

        it('logs 3rd Party platform', () => {
          data.headers = { 'x-client': 'some-third-party' };

          return analyticsService.track(eventType, data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                platform: '3rd Party',
              });
            });
        });

        it('logs unknown if headers are not passed in', () => {
          delete data.headers;

          return analyticsService.track(eventType, data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                platform: 'Unknown',
              });
            });
        });
      });

      context('Operating System', () => {
        it('sets default', () => {
          data.headers = {
            'x-client': 'third-party',
            'user-agent': 'foo',
          };

          return analyticsService.track(eventType, data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                os_name: 'Other',
                os_version: '0',
              });
            });
        });

        it('sets iOS', () => {
          data.headers = {
            'x-client': 'syndromica-ios',
            'user-agent': 'syndromica/148 (iPhone; iOS 9.3; Scale/2.00)',
          };

          return analyticsService.track(eventType, data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                os_name: 'iOS',
                os_version: '9.3.0',
              });
            });
        });

        it('sets Android', () => {
          data.headers = {
            'x-client': 'syndromica-android',
            'user-agent': 'Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19',
          };

          return analyticsService.track(eventType, data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                os_name: 'Android',
                os_version: '4.0.4',
              });
            });
        });

        it('sets Unknown if headers are not passed in', () => {
          delete data.headers;

          return analyticsService.track(eventType, data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                os_name: undefined,
                os_version: undefined,
              });
            });
        });
      });

      it('sends details about event', () => analyticsService.track(eventType, data)
        .then(() => {
          expect(Amplitude.prototype.track).to.be.calledWithMatch({
            event_properties: {
              category: 'behavior',
              resting: true,
              cronCount: 5,
            },
          });
        }));

      it('sends english item name for gear if itemKey is provided', () => {
        data.itemKey = 'headAccessory_special_foxEars';

        return analyticsService.track(eventType, data)
          .then(() => {
            expect(Amplitude.prototype.track).to.be.calledWithMatch({
              event_properties: {
                itemKey: data.itemKey,
                itemName: 'Fox Ears',
              },
            });
          });
      });

      it('sends english item name for egg if itemKey is provided', () => {
        data.itemKey = 'Wolf';

        return analyticsService.track(eventType, data)
          .then(() => {
            expect(Amplitude.prototype.track).to.be.calledWithMatch({
              event_properties: {
                itemKey: data.itemKey,
                itemName: 'Wolf Egg',
              },
            });
          });
      });

      it('sends english item name for food if itemKey is provided', () => {
        data.itemKey = 'Cake_Skeleton';

        return analyticsService.track(eventType, data)
          .then(() => {
            expect(Amplitude.prototype.track).to.be.calledWithMatch({
              event_properties: {
                itemKey: data.itemKey,
                itemName: 'Bare Bones Cake',
              },
            });
          });
      });

      it('sends english item name for hatching potion if itemKey is provided', () => {
        data.itemKey = 'Golden';

        return analyticsService.track(eventType, data)
          .then(() => {
            expect(Amplitude.prototype.track).to.be.calledWithMatch({
              event_properties: {
                itemKey: data.itemKey,
                itemName: 'Golden Hatching Potion',
              },
            });
          });
      });

      it('sends english item name for quest if itemKey is provided', () => {
        data.itemKey = 'atom1';

        return analyticsService.track(eventType, data)
          .then(() => {
            expect(Amplitude.prototype.track).to.be.calledWithMatch({
              event_properties: {
                itemKey: data.itemKey,
                itemName: 'Attack of the Mundane, Part 1: Dish Disaster!',
              },
            });
          });
      });

      it('sends english item name for purchased spell if itemKey is provided', () => {
        data.itemKey = 'seafoam';

        return analyticsService.track(eventType, data)
          .then(() => {
            expect(Amplitude.prototype.track).to.be.calledWithMatch({
              event_properties: {
                itemKey: data.itemKey,
                itemName: 'Seafoam',
              },
            });
          });
      });

      it('sends user data if provided', () => {
        const stats = {
          class: 'wizard', exp: 5, gp: 23, hp: 10, lvl: 4, mp: 30,
        };
        const user = {
          stats,
          contributor: { level: 1 },
          purchased: { plan: { planId: 'foo-plan' } },
          flags: { tour: { intro: -2 } },
          habits: [{ _id: 'habit' }],
          dailys: [{ _id: 'daily' }],
          todos: [{ _id: 'todo' }],
          rewards: [{ _id: 'reward' }],
          balance: 12,
          loginIncentives: 1,
        };

        data.user = user;

        return analyticsService.track(eventType, data)
          .then(() => {
            expect(Amplitude.prototype.track).to.be.calledWithMatch({
              user_properties: {
                Class: 'wizard',
                Experience: 5,
                Gold: 23,
                Health: 10,
                Level: 4,
                Mana: 30,
                tutorialComplete: true,
                'Number Of Tasks': {
                  habits: 1,
                  dailys: 1,
                  todos: 1,
                  rewards: 1,
                },
                contributorLevel: 1,
                subscription: 'foo-plan',
                balance: 12,
                balanceGemAmount: 48,
                loginIncentives: 1,
              },
            });
          });
      });
    });

    context('GA', () => {
      it('calls out to GA', () => analyticsService.track(eventType, data)
        .then(() => {
          expect(Visitor.prototype.event).to.be.calledOnce;
        }));

      it('sends details about event', () => analyticsService.track(eventType, data)
        .then(() => {
          expect(Visitor.prototype.event).to.be.calledWith({
            ea: 'Cron',
            ec: 'behavior',
          });
        }));
    });
  });

  describe('#trackPurchase', () => {
    let data; let
      itemSpy;

    beforeEach(() => {
      Visitor.prototype.event.yields();

      itemSpy = sandbox.stub().returnsThis();

      Visitor.prototype.transaction.returns({
        item: itemSpy,
        send: sandbox.stub().yields(),
      });

      data = {
        uuid: 'user-id',
        sku: 'paypal-checkout',
        paymentMethod: 'PayPal',
        itemPurchased: 'Gems',
        purchaseValue: 8,
        purchaseType: 'checkout',
        gift: false,
        quantity: 1,
        headers: {
          'x-client': 'syndromica-web',
          'user-agent': '',
        },
      };
    });

    context('Amplitude', () => {
      it('calls out to amplitude', () => analyticsService.trackPurchase(data)
        .then(() => {
          expect(Amplitude.prototype.track).to.be.calledOnce;
        }));

      it('uses a dummy user id if none is provided', () => {
        delete data.uuid;

        return analyticsService.trackPurchase(data)
          .then(() => {
            expect(Amplitude.prototype.track).to.be.calledWithMatch({
              user_id: 'no-user-id-was-provided',
            });
          });
      });

      context('platform', () => {
        it('logs web platform', () => {
          data.headers = { 'x-client': 'syndromica-web' };

          return analyticsService.trackPurchase(data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                platform: 'Web',
              });
            });
        });

        it('logs iOS platform', () => {
          data.headers = { 'x-client': 'syndromica-ios' };

          return analyticsService.trackPurchase(data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                platform: 'iOS',
              });
            });
        });

        it('logs Android platform', () => {
          data.headers = { 'x-client': 'syndromica-android' };

          return analyticsService.trackPurchase(data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                platform: 'Android',
              });
            });
        });

        it('logs 3rd Party platform', () => {
          data.headers = { 'x-client': 'some-third-party' };

          return analyticsService.trackPurchase(data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                platform: '3rd Party',
              });
            });
        });

        it('logs unknown if headers are not passed in', () => {
          delete data.headers;

          return analyticsService.trackPurchase(data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                platform: 'Unknown',
              });
            });
        });
      });

      context('Operating System', () => {
        it('sets default', () => {
          data.headers = {
            'x-client': 'third-party',
            'user-agent': 'foo',
          };

          return analyticsService.trackPurchase(data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                os_name: 'Other',
                os_version: '0',
              });
            });
        });

        it('sets iOS', () => {
          data.headers = {
            'x-client': 'syndromica-ios',
            'user-agent': 'syndromica/148 (iPhone; iOS 9.3; Scale/2.00)',
          };

          return analyticsService.trackPurchase(data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                os_name: 'iOS',
                os_version: '9.3.0',
              });
            });
        });

        it('sets Android', () => {
          data.headers = {
            'x-client': 'syndromica-android',
            'user-agent': 'Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19',
          };

          return analyticsService.trackPurchase(data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                os_name: 'Android',
                os_version: '4.0.4',
              });
            });
        });

        it('sets Unknown if headers are not passed in', () => {
          delete data.headers;

          return analyticsService.trackPurchase(data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                os_name: undefined,
                os_version: undefined,
              });
            });
        });
      });

      it('sends details about purchase', () => analyticsService.trackPurchase(data)
        .then(() => {
          expect(Amplitude.prototype.track).to.be.calledWithMatch({
            event_properties: {
              gift: false,
              itemPurchased: 'Gems',
              paymentMethod: 'PayPal',
              purchaseType: 'checkout',
              quantity: 1,
              sku: 'paypal-checkout',
            },
          });
        }));

      it('sends user data if provided', () => {
        const stats = {
          class: 'wizard', exp: 5, gp: 23, hp: 10, lvl: 4, mp: 30,
        };
        const user = {
          stats,
          contributor: { level: 1 },
          purchased: { plan: { planId: 'foo-plan' } },
          flags: { tour: { intro: -2 } },
          habits: [{ _id: 'habit' }],
          dailys: [{ _id: 'daily' }],
          todos: [{ _id: 'todo' }],
          rewards: [{ _id: 'reward' }],
        };

        data.user = user;

        return analyticsService.trackPurchase(data)
          .then(() => {
            expect(Amplitude.prototype.track).to.be.calledWithMatch({
              user_properties: {
                Class: 'wizard',
                Experience: 5,
                Gold: 23,
                Health: 10,
                Level: 4,
                Mana: 30,
                tutorialComplete: true,
                'Number Of Tasks': {
                  habits: 1,
                  dailys: 1,
                  todos: 1,
                  rewards: 1,
                },
                contributorLevel: 1,
                subscription: 'foo-plan',
              },
            });
          });
      });
    });

    context('GA', () => {
      it('calls out to GA', () => analyticsService.trackPurchase(data)
        .then(() => {
          expect(Visitor.prototype.event).to.be.calledOnce;
          expect(Visitor.prototype.transaction).to.be.calledOnce;
        }));

      it('sends details about purchase', () => analyticsService.trackPurchase(data)
        .then(() => {
          expect(Visitor.prototype.event).to.be.calledWith({
            ea: 'checkout',
            ec: 'commerce',
            el: 'PayPal',
            ev: 8,
          });
          expect(Visitor.prototype.transaction).to.be.calledWith('user-id', 8);
          expect(itemSpy).to.be.calledWith(8, 1, 'paypal-checkout', 'Gems', 'checkout');
        }));
    });
  });

  describe('mockAnalyticsService', () => {
    it('has stubbed track method', () => {
      expect(analyticsService.mockAnalyticsService).to.respondTo('track');
    });

    it('has stubbed trackPurchase method', () => {
      expect(analyticsService.mockAnalyticsService).to.respondTo('trackPurchase');
    });
  });
});
