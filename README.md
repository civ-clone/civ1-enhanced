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
on and imports for its side effect, so a game with `civ1-enhanced` has them and one without does not. The original's
fourteen are `@civ-clone/civ1-civilization`'s, which this package does not load.

## Rule sets

Where a rule below says "the human", that is every player whose seat is not played by the computer (`civ1-difficulty`'s
`isHuman`: a player with a client, none of them an `AIClient`), each counting as v474.05's one human. In a game with
no such seat (all computer players, or a game only watched), the v474.05 pollution and uprising rules never fire, so
switching those sets off there means no pollution and no uprisings at all, and the United Nations stops no war.

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
- `civ1-enhanced:obsolete-builds` (`OBSOLETE_BUILDS`), on to start with: a city stops building what it can no longer
  build, as that happens, and its player chooses again (civ-clone/web-renderer#693, #965). Rules added to Civ1's, so
  it supersedes nothing: switched off, a city finishes the build, as v474.05's does. Each drops a build only for its
  own reason, read from the game's `requirements` (a build whose refusals include the id of an entry naming what
  happened), so a plugin's entries count and a build refused for any other reason, such as one a city kept when the
  human captured it, is left:
  - `civ1-enhanced:player/research-complete/revalidate-builds`: a discovery that makes the build obsolete (an
    `obsoletedBy` entry naming the advance), as Gunpowder does Spearman.
  - `civ1-enhanced:city-improvement/sold/drop-builds-that-needed-it`, `…:unit/city-sabotaged/…` and
    `…:city/process-yield/…`: the city loses an improvement the build needs (a `requires` entry naming it), sold,
    sabotaged or not paid for. The `…/note-improvements` rules note what a city has at `High`, and the
    `…/drop-builds-that-needed-them` rules compare at `Low`. A city destroyed, however it happens, drops nothing, and a
    Wonder is never counted as lost: one lost with its city was still built, as v474.05 has it.
  - `civ1-enhanced:city/building-complete/drop-excluded-builds` and `…:city/captured/drop-excluded-builds`: the player
    completes, or takes a city with, something that excludes the build (an `excludedBy` entry naming it, such as
    `civ1-wonder`'s Hoover Dam entries for the plants). The captured city's own build is `CAPTURED_CITY_BUILD`'s.
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
- `civ1-enhanced:united-nations-stops-computer-wars` (`UNITED_NATIONS_STOPS_COMPUTER_WARS`), on to start with:
  `civ1-enhanced:player/pacified/united-nations` pacifies every other leader towards the owner of the United Nations,
  a computer player's too, so two computer players that meet don't go to war with its owner (civ-clone/web-renderer#30).
  Supersedes `civ1-wonder:player/pacified/united-nations`, which, as v474.05, pacifies a computer player's leader only
  towards a human owner. The Great Wall's rule is v474.05's in either case, and stops computer players going to war
  with its owner (civ-clone/web-renderer#960).
- `civ1-enhanced:even-advance-stealing` (`EVEN_ADVANCE_STEALING`), on to start with:
  `civ1-enhanced:unit/technology-stolen/steal` has a Diplomat take any advance it can, each as likely as the next
  (civ-clone/web-renderer#58), through `civ1-unit`'s `lib/stealAdvance`. Supersedes
  `civ1-unit:unit/technology-stolen/steal`, which, as v474.05, walks its list of advances from a random one and takes
  the first it can, so an advance after a run the thief knows is likelier.
- `civ1-enhanced:sdi-defense-spares-cities` (`SDI_DEFENSE_SPARES_CITIES`), off to start with:
  `civ1-enhanced:unit/detonated/halve-cities` spares a city with SDI Defense its size as well as its units under a
  nuclear attack, as players commonly believe and Civ2 has it (civ-clone/web-renderer#129). Supersedes
  `civ1-unit:unit/detonated/halve-cities`, which, as v474.05, halves it all the same. Fallout still lands around it.
- `civ1-enhanced:defectors-stay-veteran` (`DEFECTORS_STAY_VETERAN`), off to start with:
  `civ1-enhanced:unit/transferred/keep-veteran` lets a unit that changes sides, bribed or with a city, keep its veteran
  status, through `civ1-unit`'s `lib/startAfresh`; it is still unfortified, with no moves and its fuel full. Supersedes
  `civ1-unit:unit/transferred/start-afresh`, which, as v474.05, starts it afresh as a new unit, no veteran.
- `civ1-enhanced:settlers-wait-for-size-two` (`SETTLERS_WAIT_FOR_SIZE_TWO`), on to start with:
  `civ1-enhanced:city/hold/settlers-until-size-two` holds Settlers in a city of size 1 until it is size 2, at every
  level and however many cities its player has (civ-clone/web-renderer#959): the build stays chosen, its shields go on
  adding up, and it is completed the first turn the city is size 2, which the Settlers take it back to. A city that
  can never grow goes on adding shields to a build it can't finish. A `Hold` rule (`@civ-clone/core-city-build`), so
  `CityBuild#held()` gives its id from the moment a size-1 city chooses Settlers, before they are paid for, until it
  is size 2. Supersedes `civ1-unit:city/hold/chieftain-settlers`, v474.05's, which holds them only on Chieftain; on
  the other levels v474.05 builds them, the player's only city keeping its citizen and any other removed, the
  Settlers staying on its square (`civ1-unit`'s `city/building-complete/settlers-shrink-city`, which never sees a
  size-1 city while this set is on). Before this set, a size-1 city was destroyed by its Settlers, which went with it,
  at every level.
