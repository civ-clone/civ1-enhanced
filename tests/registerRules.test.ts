import {
  BARBARIAN_CITY_BUILDS,
  BARBARIAN_LEADER_RANSOM,
  BARBARIAN_UPRISINGS,
  CAPTURED_CITY_BUILD,
  DEFECTORS_STAY_VETERAN,
  ENHANCED,
  EVEN_ADVANCE_STEALING,
  HYDRO_PLANT_SITE,
  OBSOLETE_BUILDS,
  POLLUTION_IN_EVERY_CITY,
  SDI_DEFENSE_SPARES_CITIES,
  UNITED_NATIONS_STOPS_COMPUTER_WARS,
} from '../RuleSets';
// The Civ1 rules this package's sets change, and the rules they change them with (civ-clone/web-renderer#954).
import { Game } from '@civ-clone/core-game/Game';
import { expect } from 'chai';
import loadGame, { Package, pluginOrder } from './lib/loadGame';
import register from '../registerRules';

import {
  CLEAR_CAPTURED_BUILD_RULE,
  HALVE_CITIES_RULE,
  HYDRO_PLANT_SITE_RULE,
  KEEP_VETERAN_RULE,
  LAND_UPRISING_RULE,
  POLLUTION_RULE,
  RAIDERS_ONLY_RULE,
  RANSOM_RULE,
  REVALIDATE_BUILDS_RULE,
  STEAL_RULE,
  UNITED_NATIONS_PACIFIED_RULE,
} from '../RuleIds';
import {
  HALVE_CITIES_RULE as CIV1_HALVE_CITIES,
  START_AFRESH_RULE as CIV1_START_AFRESH,
  STEAL_RULE as CIV1_STEAL,
} from '@civ-clone/civ1-unit/RuleIds';
import { UNITED_NATIONS_PACIFIED_RULE as CIV1_UNITED_NATIONS_PACIFIED } from '@civ-clone/civ1-wonder/RuleIds';
import {
  HYDRO_PLANT_SITE_RULE as CIV1_HYDRO_PLANT_SITE,
  POLLUTION_RULE as CIV1_POLLUTION,
} from '@civ-clone/civ1-city-improvement/RuleIds';
import {
  LAND_UPRISING_RULE as CIV1_LAND_UPRISING,
  RAIDERS_ONLY_RULE as CIV1_RAIDERS_ONLY,
  RANSOM_RULE as CIV1_RANSOM,
} from '@civ-clone/civ1-barbarians/RuleIds';
import { KEEP_BUILD_RULE as CIV1_KEEP_BUILD } from '@civ-clone/civ1-city/RuleIds';

// Each set that takes the place of a Civ1 rule, the rule it takes the place of, and its own: all on to start with.
const replacements: [string, string, string][] = [
  [BARBARIAN_LEADER_RANSOM, CIV1_RANSOM, RANSOM_RULE],
  [CAPTURED_CITY_BUILD, CIV1_KEEP_BUILD, CLEAR_CAPTURED_BUILD_RULE],
  [POLLUTION_IN_EVERY_CITY, CIV1_POLLUTION, POLLUTION_RULE],
  [BARBARIAN_CITY_BUILDS, CIV1_RAIDERS_ONLY, RAIDERS_ONLY_RULE],
  [BARBARIAN_UPRISINGS, CIV1_LAND_UPRISING, LAND_UPRISING_RULE],
  [
    UNITED_NATIONS_STOPS_COMPUTER_WARS,
    CIV1_UNITED_NATIONS_PACIFIED,
    UNITED_NATIONS_PACIFIED_RULE,
  ],
  [EVEN_ADVANCE_STEALING, CIV1_STEAL, STEAL_RULE],
];

// Each new variant that takes the place of a Civ1 rule, the rule it takes the place of, and its own: all off to start
//  with, so play is v474.05's (civ-clone/web-renderer#960).
const variants: [string, string, string][] = [
  [SDI_DEFENSE_SPARES_CITIES, CIV1_HALVE_CITIES, HALVE_CITIES_RULE],
  [DEFECTORS_STAY_VETERAN, CIV1_START_AFRESH, KEEP_VETERAN_RULE],
];

const enabled = (game: Game, id: string): boolean =>
  game.rules.getById(id)!.enabled();

describe('registerRules', (): void => {
  it('should register against a game', (): void => {
    const game = new Game();

    expect((): void => register(game)).not.to.throw();
  });

  it('should hold its eleven sets under one parent, with the ids exported', (): void => {
    const game = loadGame();

    expect(ENHANCED).to.equal('civ1-enhanced');
    expect(HYDRO_PLANT_SITE).to.equal('civ1-enhanced:hydro-plant-site');
    expect(BARBARIAN_LEADER_RANSOM).to.equal(
      'civ1-enhanced:barbarian-leader-ransom'
    );
    expect(OBSOLETE_BUILDS).to.equal('civ1-enhanced:obsolete-builds');
    expect(CAPTURED_CITY_BUILD).to.equal('civ1-enhanced:captured-city-build');
    expect(POLLUTION_IN_EVERY_CITY).to.equal(
      'civ1-enhanced:pollution-in-every-city'
    );
    expect(BARBARIAN_CITY_BUILDS).to.equal(
      'civ1-enhanced:barbarian-city-builds'
    );
    expect(BARBARIAN_UPRISINGS).to.equal('civ1-enhanced:barbarian-uprisings');
    expect(UNITED_NATIONS_STOPS_COMPUTER_WARS).to.equal(
      'civ1-enhanced:united-nations-stops-computer-wars'
    );
    expect(EVEN_ADVANCE_STEALING).to.equal(
      'civ1-enhanced:even-advance-stealing'
    );
    expect(SDI_DEFENSE_SPARES_CITIES).to.equal(
      'civ1-enhanced:sdi-defense-spares-cities'
    );
    expect(DEFECTORS_STAY_VETERAN).to.equal(
      'civ1-enhanced:defectors-stay-veteran'
    );
    expect(game.ruleSets.get(ENHANCED)!.memberIds()).to.eql([
      HYDRO_PLANT_SITE,
      BARBARIAN_LEADER_RANSOM,
      OBSOLETE_BUILDS,
      CAPTURED_CITY_BUILD,
      POLLUTION_IN_EVERY_CITY,
      BARBARIAN_CITY_BUILDS,
      BARBARIAN_UPRISINGS,
      UNITED_NATIONS_STOPS_COMPUTER_WARS,
      EVEN_ADVANCE_STEALING,
      SDI_DEFENSE_SPARES_CITIES,
      DEFECTORS_STAY_VETERAN,
    ]);
    expect(game.ruleSets.get(HYDRO_PLANT_SITE)!.supersedes()).to.eql([
      CIV1_HYDRO_PLANT_SITE,
    ]);
    expect(game.ruleSets.get(OBSOLETE_BUILDS)!.supersedes()).to.eql([]);
    [...replacements, ...variants].forEach(([set, civ1Rule, rule]): void => {
      expect(game.ruleSets.get(set)!.supersedes(), set).to.eql([civ1Rule]);
      expect(game.ruleSets.get(set)!.memberIds(), set).to.eql([rule]);
    });
  });

  it('should start as today: the Hydro Plant as v474.05, the rest as civ-clone', (): void => {
    const game = loadGame();

    expect(game.ruleSets.state(ENHANCED)).to.equal('mixed');
    expect(game.ruleSets.state(HYDRO_PLANT_SITE)).to.equal('off');
    expect(game.ruleSets.state(OBSOLETE_BUILDS)).to.equal('on');

    expect(enabled(game, CIV1_HYDRO_PLANT_SITE)).true;
    expect(enabled(game, HYDRO_PLANT_SITE_RULE)).false;
    expect(enabled(game, REVALIDATE_BUILDS_RULE)).true;
    replacements.forEach(([set, civ1Rule, rule]): void => {
      expect(game.ruleSets.state(set), set).to.equal('on');
      expect(enabled(game, civ1Rule), civ1Rule).false;
      expect(enabled(game, rule), rule).true;
    });
    variants.forEach(([set, civ1Rule, rule]): void => {
      expect(game.ruleSets.state(set), set).to.equal('off');
      expect(enabled(game, civ1Rule), civ1Rule).true;
      expect(enabled(game, rule), rule).false;
    });

    // Nothing differs from the defaults, so a save keeps nothing.
    expect(game.ruleSets.choices()).to.eql([]);
  });

  it('should show the parent as mixed, and leave exactly the v474.05 rules running for all eleven when it is switched off', (): void => {
    const game = loadGame();

    expect(game.ruleSets.state(ENHANCED)).to.equal('mixed');

    game.ruleSets.set(ENHANCED, false);

    expect(game.ruleSets.state(ENHANCED)).to.equal('off');
    expect(enabled(game, CIV1_HYDRO_PLANT_SITE)).true;
    expect(enabled(game, HYDRO_PLANT_SITE_RULE)).false;
    expect(enabled(game, REVALIDATE_BUILDS_RULE)).false;
    [...replacements, ...variants].forEach(([set, civ1Rule, rule]): void => {
      expect(game.ruleSets.state(set), set).to.equal('off');
      expect(enabled(game, civ1Rule), civ1Rule).true;
      expect(enabled(game, rule), rule).false;
    });
    expect(game.ruleSets.validate()).to.eql([]);
  });

  it('should switch on every enhanced rule when the parent is switched on, and supersede every Civ1 rule they replace', (): void => {
    const game = loadGame();

    game.ruleSets.set(ENHANCED, true);

    expect(game.ruleSets.state(ENHANCED)).to.equal('on');
    expect(enabled(game, CIV1_HYDRO_PLANT_SITE)).false;
    expect(enabled(game, HYDRO_PLANT_SITE_RULE)).true;
    expect(enabled(game, REVALIDATE_BUILDS_RULE)).true;
    [...replacements, ...variants].forEach(([, civ1Rule, rule]): void => {
      expect(enabled(game, civ1Rule), civ1Rule).false;
      expect(enabled(game, rule), rule).true;
    });
    expect(game.ruleSets.validate()).to.eql([]);
  });

  // A superseded id that names no rule is only shown (`unknown-superseded`), not blocking, and the rule it meant goes
  //  on running beside its replacement: a renamed Civ1 ransom rule paid a lone leader 200 gold.
  it('should supersede only rules that are registered, with every package loaded, so no Civ1 rule runs beside its replacement', (): void => {
    const game = loadGame(),
      superseded = game.ruleSets.entries().flatMap((set) => set.supersedes());

    expect(superseded).to.eql([
      CIV1_HYDRO_PLANT_SITE,
      CIV1_RANSOM,
      CIV1_KEEP_BUILD,
      CIV1_POLLUTION,
      CIV1_RAIDERS_ONLY,
      CIV1_LAND_UPRISING,
      CIV1_UNITED_NATIONS_PACIFIED,
      CIV1_STEAL,
      CIV1_HALVE_CITIES,
      CIV1_START_AFRESH,
    ]);
    superseded.forEach((id: string): void => {
      expect(game.rules.getById(id), id).not.to.be.null;
    });
    expect(
      game.ruleSets
        .validate()
        .filter(({ kind }) => kind === 'unknown-superseded')
    ).to.eql([]);
  });

  it('should find no problems with every package loaded, in either state', (): void => {
    const game = loadGame();

    expect(game.ruleSets.validate()).to.eql([]);
    expect((): void => game.ruleSets.check()).not.to.throw();
  });

  it('should find only orphans that do not block, with the superseded Civ1 packages not loaded', (): void => {
    const game = loadGame(['civ1-unit']),
      problems = game.ruleSets.validate();

    expect(
      problems.map(({ kind, ids, blocking }) => ({ kind, ids, blocking }))
    ).to.eql([
      {
        kind: 'unknown-superseded',
        ids: [HYDRO_PLANT_SITE, CIV1_HYDRO_PLANT_SITE],
        blocking: false,
      },
      {
        kind: 'unknown-superseded',
        ids: [BARBARIAN_LEADER_RANSOM, CIV1_RANSOM],
        blocking: false,
      },
      {
        kind: 'unknown-superseded',
        ids: [CAPTURED_CITY_BUILD, CIV1_KEEP_BUILD],
        blocking: false,
      },
      {
        kind: 'unknown-superseded',
        ids: [POLLUTION_IN_EVERY_CITY, CIV1_POLLUTION],
        blocking: false,
      },
      {
        kind: 'unknown-superseded',
        ids: [BARBARIAN_CITY_BUILDS, CIV1_RAIDERS_ONLY],
        blocking: false,
      },
      {
        kind: 'unknown-superseded',
        ids: [BARBARIAN_UPRISINGS, CIV1_LAND_UPRISING],
        blocking: false,
      },
      {
        kind: 'unknown-superseded',
        ids: [UNITED_NATIONS_STOPS_COMPUTER_WARS, CIV1_UNITED_NATIONS_PACIFIED],
        blocking: false,
      },
    ]);
    expect((): void => game.ruleSets.check()).not.to.throw();
  });

  it('should find only orphans that do not block with no Civ1 package loaded at all', (): void => {
    const game = loadGame([]);

    expect(game.ruleSets.validate().every(({ blocking }) => !blocking)).true;
    expect(
      game.ruleSets
        .validate()
        .every(({ kind }) => kind === 'unknown-superseded')
    ).true;
  });

  it('should keep what was chosen through a save and a new game', (): void => {
    const game = loadGame();

    game.ruleSets.set(HYDRO_PLANT_SITE, true);
    game.ruleSets.set(BARBARIAN_LEADER_RANSOM, false);
    game.ruleSets.set(OBSOLETE_BUILDS, false);
    // Every other one of the four that started on.
    game.ruleSets.set(CAPTURED_CITY_BUILD, false);
    game.ruleSets.set(BARBARIAN_CITY_BUILDS, false);
    game.ruleSets.set(EVEN_ADVANCE_STEALING, false);
    // One of the two that start off.
    game.ruleSets.set(SDI_DEFENSE_SPARES_CITIES, true);

    const choices = game.ruleSets.choices();

    expect(choices).to.eql([
      { id: HYDRO_PLANT_SITE, value: true },
      { id: BARBARIAN_LEADER_RANSOM, value: false },
      { id: OBSOLETE_BUILDS, value: false },
      { id: CAPTURED_CITY_BUILD, value: false },
      { id: BARBARIAN_CITY_BUILDS, value: false },
      { id: EVEN_ADVANCE_STEALING, value: false },
      { id: SDI_DEFENSE_SPARES_CITIES, value: true },
    ]);

    const restored = loadGame();

    expect(restored.ruleSets.restore(choices)).to.eql([]);
    expect(restored.ruleSets.choices()).to.eql(choices);
    expect(enabled(restored, CIV1_HYDRO_PLANT_SITE)).false;
    expect(enabled(restored, HYDRO_PLANT_SITE_RULE)).true;
    expect(enabled(restored, CIV1_RANSOM)).true;
    expect(enabled(restored, RANSOM_RULE)).false;
    expect(enabled(restored, REVALIDATE_BUILDS_RULE)).false;
    expect(enabled(restored, CIV1_KEEP_BUILD)).true;
    expect(enabled(restored, CLEAR_CAPTURED_BUILD_RULE)).false;
    expect(enabled(restored, CIV1_POLLUTION)).false;
    expect(enabled(restored, POLLUTION_RULE)).true;
    expect(enabled(restored, CIV1_RAIDERS_ONLY)).true;
    expect(enabled(restored, RAIDERS_ONLY_RULE)).false;
    expect(enabled(restored, CIV1_LAND_UPRISING)).false;
    expect(enabled(restored, LAND_UPRISING_RULE)).true;
    expect(enabled(restored, CIV1_UNITED_NATIONS_PACIFIED)).false;
    expect(enabled(restored, UNITED_NATIONS_PACIFIED_RULE)).true;
    expect(enabled(restored, CIV1_STEAL)).true;
    expect(enabled(restored, STEAL_RULE)).false;
    expect(enabled(restored, CIV1_HALVE_CITIES)).false;
    expect(enabled(restored, HALVE_CITIES_RULE)).true;
    expect(enabled(restored, CIV1_START_AFRESH)).true;
    expect(enabled(restored, KEEP_VETERAN_RULE)).false;
    expect(restored.ruleSets.validate()).to.eql([]);
  });

  it('should keep the parent switched off through a save, as the sets that start on switched off', (): void => {
    const game = loadGame();

    game.ruleSets.set(ENHANCED, false);

    const choices = game.ruleSets.choices(),
      restored = loadGame();

    // The Hydro Plant's, SDI Defense's and the defectors' sets already start off, so the parent switched off differs
    //  from the defaults in the others.
    expect(choices).to.eql([
      { id: BARBARIAN_LEADER_RANSOM, value: false },
      { id: OBSOLETE_BUILDS, value: false },
      { id: CAPTURED_CITY_BUILD, value: false },
      { id: POLLUTION_IN_EVERY_CITY, value: false },
      { id: BARBARIAN_CITY_BUILDS, value: false },
      { id: BARBARIAN_UPRISINGS, value: false },
      { id: UNITED_NATIONS_STOPS_COMPUTER_WARS, value: false },
      { id: EVEN_ADVANCE_STEALING, value: false },
    ]);
    expect(restored.ruleSets.restore(choices)).to.eql([]);
    expect(restored.ruleSets.state(ENHANCED)).to.equal('off');
    expect(enabled(restored, REVALIDATE_BUILDS_RULE)).false;
    [...replacements, ...variants].forEach(([, civ1Rule, rule]): void => {
      expect(enabled(restored, civ1Rule), civ1Rule).true;
      expect(enabled(restored, rule), rule).false;
    });
  });

  describe('the order packages load in', (): void => {
    // Every rule with an id, and whether it is switched on.
    const running = (game: Game): [string, boolean][] =>
      game.rules
        .entries()
        .filter((rule) => rule.id() !== null)
        .map((rule): [string, boolean] => [rule.id()!, rule.enabled()])
        .sort(([a], [b]) => a.localeCompare(b));

    const orders: [string, Package[]][] = [
      [
        'civ1-enhanced first',
        [
          'civ1-enhanced',
          ...pluginOrder.filter((name) => name !== 'civ1-enhanced'),
        ],
      ],
      [
        'civ1-enhanced last',
        [
          ...pluginOrder.filter((name) => name !== 'civ1-enhanced'),
          'civ1-enhanced',
        ],
      ],
    ];

    it("should be by name, the plugin loader's, in these tests", (): void => {
      expect(pluginOrder).to.eql([
        'civ1-barbarians',
        'civ1-city',
        'civ1-city-improvement',
        'civ1-enhanced',
        'civ1-unit',
        'civ1-wonder',
      ]);
    });

    orders.forEach(([name, order]): void => {
      it(`should leave the same rules running with ${name}, by default and with every set switched`, (): void => {
        const byName = loadGame(),
          other = loadGame(undefined, order);

        expect(running(other)).to.eql(running(byName));

        [true, false].forEach((on: boolean): void => {
          byName.ruleSets.set(ENHANCED, on);
          other.ruleSets.set(ENHANCED, on);

          expect(running(other)).to.eql(running(byName));
        });

        expect(other.ruleSets.validate()).to.eql([]);
      });
    });
  });
});
