# civ1-enhanced

Rules that change Civilization I's, each in a rule set a new game can switch (civ-clone/web-renderer#954). For the
rules below, the `civ1-*` packages play as v474.05 does and this one holds the departures from it, so that a game
without it loaded, or with its sets switched off, plays them as v474.05. Other departures from v474.05 are still inside
the `civ1-*` packages (see the survey on civ-clone/web-renderer#954), and move here one at a time.

Every set is beneath `civ1-enhanced` (`RuleSets.ENHANCED`), which a setup window can draw as one three-state checkbox.
A set that `supersedes` a Civ1 rule takes its place while the set is on, and gives it back when switched off, without
the Civ1 package knowing (`@civ-clone/core-rule`'s `RuleSet`). One whose Civ1 package is not loaded is only an orphan,
which `validate()` shows and does not block on.

The ids it supersedes are imported from each Civ1 package's `RuleIds`, so a rule renamed there breaks this package's
build rather than leaving both rules running. Its own rule ids are exported the same way, from `RuleIds.ts`.

## Additional civilizations

Loading this package also loads the twelve civilizations the original does not have (Sioux, Inca, Brazilian, Malian,
Kongo, Ethiopian, Viking, Khmer, Indonesian, Japanese, Australian and Chukchi), with their leaders, traits, national
themes and Earth start tiles. They are provided by `@civ-clone/civ1-world-civilizations`, which this package depends
on and imports for its side effect, so a game with `civ1-enhanced` has them and one without does not.

## Rule sets

Where a rule below says "the human", that is every player whose seat is not played by the computer (`civ1-difficulty`'s
`isHuman`: a player with a client, none of them an `AIClient`), each counting as v474.05's one human. In a game with
no such seat (all computer players, or a game only watched), the v474.05 pollution and uprising rules never fire, so
switching those sets off there means no pollution and no uprisings at all.

- `civ1-enhanced:hydro-plant-site` (`HYDRO_PLANT_SITE`), off to start with: `civ1-enhanced:city/build/hydro-plant-site`
  lets a city build a Hydro Plant with Mountains or a River on its own square as well as next to it, as the manual's
  "on or near" has it. Supersedes `civ1-city-improvement:city/build/hydro-plant-site`, which, as v474.05, looks only
  at the eight squares around the city. Its `requirements` entry (`Requirements.hydroPlantSite`, condition
  `civ1-enhanced:mountains-or-river-on-or-nearby`) likewise takes the place of `civ1-city-improvement`'s while it is on.
- `civ1-enhanced:barbarian-leader-ransom` (`BARBARIAN_LEADER_RANSOM`), on to start with:
  `civ1-enhanced:unit/destroyed/ransom` pays a civilization 100 gold for a barbarian leader it kills however he dies,
  in a stack that another unit defended too (civ-clone/web-renderer#171), through `civ1-barbarians`' `lib/ransom`, so
  `barbarians:ransom` is emitted as before. Supersedes `civ1-barbarians:unit/defeated/ransom`, which, as v474.05, pays
  only for a leader who defends and loses.
- `civ1-enhanced:obsolete-builds` (`OBSOLETE_BUILDS`), on to start with:
  `civ1-enhanced:player/research-complete/revalidate-builds` drops what a city is building once a discovery makes it
  obsolete, as Gunpowder does Spearman, and its player chooses again (civ-clone/web-renderer#693). A rule added to
  Civ1's, so it supersedes nothing: switched off, a city finishes the build, as v474.05's does.
- `civ1-enhanced:captured-city-build` (`CAPTURED_CITY_BUILD`), on to start with:
  `civ1-enhanced:city/captured/clear-build` clears what a city the human captures was building, so the human chooses
  at their own price (civ-clone/web-renderer#670, #500), through `civ1-city`'s `lib/capturedBuild`. Supersedes
  `civ1-city:city/captured/keep-build`, which, as v474.05, leaves the human building the item, from no shields, at
  their own price. A computer player that takes a city chooses again either way, as v474.05's does
  (`civ1-city:city/captured/clear-build`).
- `civ1-enhanced:pollution-in-every-city` (`POLLUTION_IN_EVERY_CITY`), on to start with:
  `civ1-enhanced:city/process-yield/pollution` rolls for pollution in every city (civ-clone/web-renderer#32), through
  `civ1-city-improvement`'s `lib/pollute`. Supersedes `civ1-city-improvement:city/process-yield/pollution`, which, as
  v474.05, rolls only in the human's cities.
- `civ1-enhanced:barbarian-city-builds` (`BARBARIAN_CITY_BUILDS`), on to start with:
  `civ1-enhanced:city/build/raiders-only` lets a barbarian city build any land unit that attacks, other than Settlers,
  Diplomats and Caravans, that at least two civilizations can build (civ-clone/web-renderer#27). Supersedes
  `civ1-barbarians:city/build/raiders-only`, which, as v474.05, builds a Warrior while the barbarians have no unit,
  then Swordmen, and Knights once anyone has Explosives.
- `civ1-enhanced:barbarian-uprisings` (`BARBARIAN_UPRISINGS`), on to start with:
  `civ1-enhanced:turn/start/land-uprising` lets an uprising break out near any civilization's city
  (civ-clone/web-renderer#27), through `civ1-barbarians`' `lib/landUprising`, so `barbarians:uprising` is emitted as
  before. Supersedes `civ1-barbarians:turn/start/land-uprising`, which, as v474.05, lets only the human's cities rise.
