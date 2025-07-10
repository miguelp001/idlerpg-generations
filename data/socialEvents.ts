
// Placeholders for character names, which will be replaced dynamically in the game logic.
const P1 = '[P1]';
const P2 = '[P2]';

// Events involving a single party member.
const soloEvents: string[] = [
  `${P1} pauses to admire the scenery.`,
  `${P1} quietly sharpens their weapon.`,
  `${P1} checks their pack for supplies.`,
  `${P1} adjusts their armor straps, muttering about the fit.`,
  `${P1} studies the map, looking thoughtful.`,
  `${P1} hums a forgotten tune from their homeland.`,
  `${P1} reties their bootlaces with practiced ease.`,
  `${P1} stares into the distance, lost in thought.`,
  `${P1} does a few quick stretches to stay limber.`,
  `${P1} practices a fighting stance, shadowboxing with the air.`,
  `${P1} takes a moment to clean their weapon with an oiled rag.`,
  `${P1} sips from their water skin with a sigh of relief.`,
  `${P1} mutters something about the weather being too hot/cold.`,
  `${P1} pulls their cloak tighter against a sudden chill.`,
  `${P1} examines a strange flower they found on the path.`,
  `${P1} kicks a loose stone off the path with a satisfying thud.`,
  `${P1} glances nervously at the shadows, hand resting on their weapon.`,
  `${P1} cracks their knuckles with a sense of anticipation.`,
  `${P1} sketches something in a small, worn notebook.`,
  `${P1} silently mouths a prayer or incantation.`,
  `${P1} seems to be counting their gold under their breath.`,
  `${P1} yawns widely, betraying a moment of boredom.`,
  `${P1} scratches an old scar, a distant look in their eyes.`,
  `${P1} practices a complex magical gesture with their hands.`,
  `${P1} checks the integrity of their shield, tapping it lightly.`,
  `${P1} nibbles on a piece of dried fruit from their pouch.`,
  `${P1} looks up at the sky, as if trying to read the clouds for omens.`,
  `${P1} seems to be listening intently to a sound no one else can hear.`,
  `${P1} polishes a small trinket they carry for good luck.`,
  `${P1} whistles a cheerful, if slightly off-key, melody.`,
  `${P1} sighs heavily, the weight of the journey showing for a moment.`,
  `${P1} tests the wind, sniffing the air like a predator.`,
  `${P1} finds a comfortable rock and sits for a moment, observing the others.`,
  `${P1} traces a symbol in the dirt with the tip of their boot.`,
  `${P1} complains about a rock in their boot.`,
  `${P1} tells a terrible joke that no one laughs at.`,
  `${P1} tries to juggle a few rocks, and fails spectacularly.`,
  `${P1} points out a cloud that looks like a dragon.`,
  `${P1} recalls a story from their childhood, a nostalgic smile on their face.`,
  `${P1} pulls a wildflower and tucks it behind their ear.`,
  `${P1} tightens the grip on their weapon, feeling its familiar weight.`,
  `${P1} checks their reflection in a puddle.`,
  `${P1} wonders aloud what they'll have for dinner.`,
  `${P1} fumbles with a piece of equipment before getting it right.`,
  `${P1} seems completely unfazed by the surrounding dangers.`,
  `${P1} takes a deep breath, centering themselves.`,
  `${P1} looks over the party, a flicker of pride in their eyes.`,
  `${P1} taps their foot impatiently, eager to move on.`,
  `${P1} examines their hands, calloused and worn from battle.`,
  `${P1} finds an interesting-looking beetle on the ground.`,
  `${P1} carves a notch into their bow/staff.`,
  `${P1} daydreams with a faint smile.`,
  `${P1} checks the position of the sun.`,
  `${P1} spits on the ground with disgust.`,
  `${P1} practices their aim by tossing a rock at a tree.`,
  `${P1} seems to be composing a poem in their head.`,
  `${P1} lets out a sudden, loud sneeze.`,
  `${P1} checks their inventory, making sure everything is in its place.`,
  `${P1} feels a phantom pain from an old wound.`,
  `${P1} looks back the way they came, a hint of regret on their face.`,
];

// Events involving two party members.
const twoPersonEvents: string[] = [
  `${P1} shares their water skin with ${P2}.`,
  `${P1} and ${P2} exchange a knowing glance.`,
  `${P1} points out something in the distance to ${P2}.`,
  `${P1} offers ${P2} a piece of jerky, which is graciously accepted.`,
  `${P1} and ${P2} fall into a quiet, comfortable conversation about home.`,
  `${P1} asks ${P2} to check a strap on their back armor.`,
  `${P1} claps ${P2} on the shoulder reassuringly.`,
  `${P1} and ${P2} briefly spar, testing each other's skills.`,
  `${P1} teaches ${P2} a simple, useful knot.`,
  `${P1} and ${P2} share a quiet laugh about a past adventure.`,
  `${P1} corrects ${P2}'s footing during a practice stance.`,
  `${P1} quizzes ${P2} on monster weaknesses.`,
  `${P1} seems to be in a hushed, intense argument with ${P2}.`,
  `${P1} tends to a small cut on ${P2}'s arm.`,
  `${P1} and ${P2} compare the wear and tear on their weapons.`,
  `${P1} silently gestures for ${P2} to be quiet as a sound is heard.`,
  `${P1} helps ${P2} up after they stumble on a root.`,
  `${P1} gives ${P2} a nod of respect after a clever observation.`,
  `${P1} and ${P2} study the map together, debating the best path forward.`,
  `${P1} shows ${P2} a passage in a book they're reading.`,
  `${P1} and ${P2} have a friendly competition to see who can skip a stone further.`,
  `${P1} listens patiently as ${P2} recounts a worry.`,
  `${P1} challenges ${P2} to a race to a nearby tree.`,
  `${P1} and ${P2} take up watch together, back to back.`,
  `${P1} makes a cynical remark, and ${P2} rolls their eyes.`,
  `${P1} compliments ${P2}'s fighting style.`,
  `${P1} asks ${P2} for their opinion on a tactical decision.`,
  `${P1} and ${P2} seem to be making a secret handshake.`,
  `${P1} warns ${P2} about a loose rock on the path.`,
  `${P1} and ${P2} work together to move a fallen log out of the way.`,
  `${P1} seems to be trying to teach ${P2} a song, with mixed results.`,
  `${P1} and ${P2} fall silent, watching the sunset together.`,
  `${P1} asks ${P2} about their family.`,
  `${P1} and ${P2} share a look of mutual exhaustion.`,
  `${P1} gives ${P2} the last of their rations.`,
  `${P1} borrows a whetstone from ${P2}.`,
  `${P1} and ${P2} discuss the best way to cook a goblin.`,
  `${P1} and ${P2} stare each other down in a silent, unspoken challenge.`,
  `${P1} helps ${P2} clean their armor.`,
  `${P1} makes fun of ${P2}'s snoring.`,
  `${P1} asks ${P2} to remind them of that one time...`,
  `${P1} and ${P2} sit apart from the group, having a private discussion.`,
  `${P1} returns a lost item to ${P2}.`,
  `${P1} protects ${P2} from a falling branch.`,
  `${P1} seems annoyed by ${P2}'s constant humming.`,
  `${P1} and ${P2} appear to be planning some mischief.`,
  `${P1} thanks ${P2} for their help in the last fight.`,
  `${P1} notices ${P2} is looking down and tries to cheer them up.`,
  `${P1} and ${P2} disagree on which way is north.`,
  `${P1} gives ${P2} a nickname. It's unclear if ${P2} likes it.`,
  `${P1} bets ${P2} they can't hit a distant tree with a rock.`,
  `${P1} and ${P2} get into a heated debate about philosophy.`,
  `${P1} trims ${P2}'s hair, rather poorly.`,
  `${P1} and ${P2} guard the camp while the others rest.`,
  `${P1} holds a torch while ${P2} reads a scroll.`,
  `${P1} asks ${P2} about the strange marking on their gear.`,
  `${P1} and ${P2} reminisce about a tavern they once visited.`,
  `${P1} dares ${P2} to eat a strange-looking mushroom.`,
  `${P1} and ${P2} have a thumb war.`,
  `${P1} points out a constellation to ${P2} in the night sky.`,
];

// Events that affect or are observed by the whole party.
const partyEvents: string[] = [
  `A sense of camaraderie settles over the party.`,
  `The party takes a short break to rest their weary feet.`,
  `An eerie silence falls over the group, every rustle of leaves sounding like a threat.`,
  `A sudden gust of wind kicks up dust, forcing everyone to shield their eyes.`,
  `The distant cry of a strange beast puts everyone on edge.`,
  `The party shares a meal, the simple act feeling like a grand feast.`,
  `A feeling of being watched sends a shiver through the group.`,
  `The party finds a strange, ancient carving on a rock face.`,
  `The sun breaks through the clouds, warming the party's spirits.`,
  `A light, steady rain begins to fall, dampening the mood slightly.`,
  `The group finds a stream with clear, cool water, and joyfully refills their skins.`,
  `The path ahead looks treacherous, and the party pauses to plan their approach.`,
  `A collective sigh of relief as a tense moment passes without incident.`,
  `The smell of woodsmoke on the wind alerts the party to a nearby camp. Friend or foe?`,
  `The party discovers the tracks of a large, unknown creature.`,
  `A flock of birds suddenly takes flight from a nearby tree, startling everyone.`,
  `The group passes a weathered, forgotten shrine to an unknown god.`,
  `A strange fog rolls in, reducing visibility and muffling sound.`,
  `The party finds a patch of delicious-looking berries. Are they safe to eat?`,
  `Someone starts a story that the whole party listens to intently.`,
  `The temperature drops suddenly, and the party huddles together for warmth.`,
  `The group finds the remains of a less fortunate adventuring party.`,
  `A debate breaks out about the division of loot from the last encounter.`,
  `The party stumbles upon a breathtaking vista.`,
  `A chorus of frogs or insects starts up, filling the air with sound.`,
  `The party's food supplies are running low, sparking some concern.`,
  `The group crosses a rickety, old rope bridge.`,
  `A feeling of dread seems to emanate from the path ahead.`,
  `The party finds a small, abandoned campsite.`,
  `Someone makes a joke that sets the entire party laughing.`,
  `The group realizes they might be walking in circles.`,
  `A shared memory of a former companion brings a moment of sad reflection.`,
  `The air grows thick with the smell of ozone, hinting at an approaching storm.`,
  `The party works together to set up camp for the night.`,
  `A shooting star streaks across the night sky.`,
  `The group hears the sound of distant battle.`,
  `The party finds a treasure map, but it's old and torn.`,
  `An argument over the best camping spot ensues.`,
  `The party feels a renewed sense of purpose.`,
  `A sense of impending doom hangs heavy in the air.`,
  `The group finds a beautiful, hidden waterfall.`,
  `The morale of the party seems particularly high today.`,
  `A mysterious merchant appears on the road ahead.`,
  `The party feels the ground tremble slightly.`,
  `The group finds a message scrawled on a tree: "TURN BACK".`,
  `The sounds of the forest suddenly go quiet.`,
  `The party finds a monument to a long-forgotten hero.`,
  `The air smells sweet, almost unnaturally so.`,
  `The path is blocked by a massive, fallen tree.`,
  `A feeling of hope lifts the party's spirits.`,
  `The stars seem unusually bright tonight.`,
  `The party discovers a hidden cave behind a waterfall.`,
  `A sense of unease spreads as the shadows lengthen.`,
  `The party finds an old, rusted helmet on the ground.`,
  `The moon is full, bathing the landscape in an ethereal glow.`,
  `A howl echoes in the distance, closer than is comfortable.`,
  `The party agrees on a marching order.`,
  `Everyone seems to be on the same page for once.`,
  `A friendly rivalry seems to be brewing within the group.`,
  `The party moves with an efficient, practiced silence.`,
];

// Personality-driven events. These are generic but hint at specific traits.
const personalityEvents: string[] = [
    `${P1} suggests a reckless shortcut.`, // Brave
    `${P1} double-checks the rope knots before the party descends.`, // Cautious
    `${P1} tells a rousing tale of heroism, lifting everyone's spirits.`, // Jovial
    `${P1} reminds everyone to stay focused on the mission.`, // Serious
    `${P1}'s eyes light up at the sight of a glittering mineral vein.`, // Greedy
    `${P1} offers their cloak to a shivering ${P2}.`, // Generous
    `${P1} rushes to the front of the party, eager to face whatever is next.`, // Brave
    `${P1} points out a potential ambush spot up ahead.`, // Cautious
    `${P1} starts a sing-along, much to the annoyance of some.`, // Jovial
    `${P1} silently disapproves of the party's frequent breaks.`, // Serious
    `${P1} asks what the reward will be for this quest again.`, // Greedy
    `${P1} spends some time helping a struggling ${P2} with their pack.`, // Generous
    `${P1} scoffs at the idea of being afraid.`, // Brave
    `${P1} insists on taking the first watch. And the second.`, // Cautious
    `${P1} gives everyone in the party a friendly, if sometimes silly, nickname.`, // Jovial
    `${P1} pores over the map, ignoring the idle chatter around them.`, // Serious
    `${P1} meticulously inspects a dead monster for anything valuable.`, // Greedy
    `${P1} suggests the party pool their resources for the common good.`, // Generous
    `A tense silence is broken by ${P1} letting out a war cry... just for practice.`, // Brave
    `${P1} tests the stability of a bridge before letting anyone else cross.`, // Cautious
    `${P1} organizes a small game to pass the time during a rest.`, // Jovial
    `${P1} interrupts a moment of levity to discuss battle strategy.`, // Serious
    `${P1} tries to haggle with a squirrel for its nut.`, // Greedy
    `${P1} makes sure everyone has had enough to eat and drink.`, // Generous
    `${P1} wants to charge headfirst into the spooky-looking cave.`, // Brave
    `${P1} advises against it, suggesting they observe it from a distance first.`, // Cautious
    `${P1} thinks the spooky cave would be a great place for a party.`, // Jovial
    `${P1} is only concerned with whether the cave is on the path to their objective.`, // Serious
    `${P1} wonders if there's treasure in the spooky cave.`, // Greedy
    `${P1} worries that someone might be hurt inside the spooky cave and need help.`, // Generous
];


export const OFFLINE_SOCIAL_EVENTS = {
    solo: soloEvents,
    twoPerson: twoPersonEvents,
    party: partyEvents,
    personality: personalityEvents,
};
