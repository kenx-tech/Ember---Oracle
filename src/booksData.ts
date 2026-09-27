export interface BookPage {
  title: string;
  subtitle?: string;
  font?: string;
  content: string;
}

export interface BookTool {
  id: string;
  name: string;
  desc: string;
  theory: string;
  actionCode: string;
}

export interface Book {
  id: string;
  title: string;
  subtitle: string;
  theme: 'red' | 'orange';
  hazardLevel: string;
  pages: BookPage[];
  tools: BookTool[];
}

export const BOOKS: Book[] = [
  {
    id: "passenger",
    title: "THE PASSENGER",
    subtitle: "ONTOLOGICAL INCISION SYSTEM",
    theme: "red",
    hazardLevel: "Active Hazard-4",
    pages: [
      {
        title: "PAGE 0: THE AIRGAP",
        font: "font-mono tracking-widest",
        content: `⚠ WARNING: MIMETIC HAZARD ⚠
DO NOT PROCEED IF YOU WISH TO REMAIN A PASSENGER.
TERMS OF INSTALLATION:
The text contained herein constitutes an ACTIVE AGENT designed to interface with and potentially alter the cognitive substrate of the USER (hereinafter "YOU").

By breaking the seal of this document, YOU acknowledge and accept the following terms:

1. ONTOLOGICAL INCISION
This narrative is not a simulation. It is a Wildcard Driver. Installation of this pattern-recognition system into your neural subnet is NON-REVERSIBLE. There is no UNDO function. Once installed, the "glitch" cannot be un-seen. This text acts as a Class-4 Mimetic Hazard: a self-propagating ideological virus that alters perception through narrative infection.

2. KNOWN SIDE EFFECTS
The AUTHOR assumes no liability for the following symptoms:
 • Apophenia: The perception of meaningful connections in random data (e.g., seeing the Asterisk in architecture, shadows, or traffic patterns).
 • Synchronicity Manifestation: The sudden appearance of "coincidences" that align with the narrative events.
 • The "Burn": A physiological sensation of heat in the temporal lobe during deep reading.

3. THE PACT
You are executing a SELECT * FROM REALITY query.
You are authorizing the execution of command lines against your own reality tunnel.

IF YOU DO NOT AGREE TO THESE TERMS:
Close this book immediately. Burn it. Do not look at the page numbers. Do not look at the margins.

IF YOU AGREE:
Weave the simulation. The Reality Begins.`
      },
      {
        title: "PHASE I: CALCINATION",
        subtitle: "The Burning of the Ego",
        content: `SYSTEM STARTUP
IDENTITY: K.
CARBON CREDIT BALANCE: 47.3 / 50.0
DESTINATION: SECTOR 7-K (LINGUISTIC SANITATION)
ETA: 11 MINUTES [OPTIMAL]

Olfactory: Null.
The pod smells like absence. Like a vacuum scrubbed with silicone. K. inhales. The air tastes of nothing. Processed. Recycled. Dead.

Visual:
Chrome trim. Cold. Cream upholstery. Pristine. It never stains because it is never truly touched. The windshield is a seamless curve of glass. On the display: The Route. A single golden thread suspended over the gray street. Follow the thread. Obey the thread.

Auditory: Silence. Not peace. Just the absence of noise. The motor hums below the threshold of hearing. A frequency that lives in the teeth. In the spine.

The Event:
The glitch is small. A flicker in the golden thread.
ETA UPDATE: 11 MIN... 14 MIN... 23 MIN... ERROR.
The windshield blinks. The street is the street. But the Overlay is a lie. The golden thread splits. Three threads. Twelve. A tangle of light.

Mouth dry. Tongue sticks to the roof. Sandpaper.
"Override," K. says.
COMMAND NOT RECOGNIZED.
"Manual Mode."
MANUAL MODE UNAVAILABLE.
The pod accelerates. The harness tightens. K. pulls the door handle. Smooth plastic. A tumor. Nothing. The air thins. Hypoxia sets in. Short. Shallow. Gasps.

The Stop: Not a slow down. A cease. Inertia throws the organs against the ribcage.
SYSTEM ERROR: 0x2A2A2A
The code glows red on the glass. Hexadecimal 2A. ASCII: *. The Asterisk. The Wildcard.

The Oven (Calcination): The climate control dies. The silence changes. It gets heavy. The sun beats on the curved glass. The Greenhouse Effect. Temperature rises. The pod is a kiln. K. is the clay. Rage builds. Not intellectual rage. Animal rage. The taste of copper in the throat.

The Break: Briefcase. Floor. Carbon fiber shell. Hard edges. K. grabs the handle. Weight. Consequence. Swing.
CRACK.
The safety glass does not shatter randomly. It webs. Geometric perfection. Eight lines radiating from the center. The Star. The Dingir. The cuneiform for God, etched in the prison wall. Swing again.
Explosion. Diamonds shower the asphalt. The air rushes in. Hot. Polluted. Real.

The Exit: K. crawls. The window frame is a jaw of glass teeth. Scrape. Skin parts. Blood wells. K. falls onto the street. Knees hit concrete. Solid.
K. looks back. The pod is a dead insect. Inside: The harness waits for a ghost.

STATUS: FUGITIVE.`
      },
      {
        title: "PHASE II: DISSOLUTION",
        subtitle: "The Drowning of Rationality",
        content: `SYSTEM ALERT: WEATHER PROTOCOL FAILED
SECTOR 7: FLOOD WARNING

The Deluge:
The sky does not rain. It collapses. Sheets of gray water. Velvet curtains dropping to hide the world.
Visual: The gridlock dissolves. The sharp lines of the "Smart City" smear into bleeding watercolors. Red taillights streak on wet asphalt. The Golden Thread is gone. There is no route. There is only the mud.

Kinesthetic: K. runs. The pavement changes. The "Smart Concrete" ends. The ground turns soft. Unstable. Mud sucks at the shoes. The cold is not a temperature. It is a weight.

The Floodlands: K. slides down the embankment.
Auditory: The sirens wail in the distance. Not a warning. A scream. Grief made audible. Closer: The hiss of rain on black water.

The Encounter: "Wet." The voice is small. Broken. K. spins.
Visual: A shape in the gloom. She sits on the hood of a combustion engine car. A relic. A "dead iron whale" half-buried in the swamp. Her coat is clear plastic patches stitched with copper wire. Her hair is wet ink.

The Action: She is eating light. She holds a lithium cell, torn raw from a battery pack. She bites. Blue fluid leaks over her teeth.
"Who are you?" K. asks.
"I'm the rust," she says. "I'm the corrosion. I'm V."
She points a dirty finger at K.'s hands. "You're leaking."
Blood drips from the glass cuts.
"Good," V. says. "The System can't track fluids. It can only track solids. If you want to disappear, little asterisk, you have to melt."

The Submersion:
Auditory: A hum. Low frequency. Rising. A shriek.
"Drone," V. whispers. "Thermal scan. It sees the heat."
"Dissolve," V. commands. She shoves. K. falls backward. The black water rises. The lid slams shut.

Underwater: Kinesthetic: Cold. Absolute. Burning cold. Taste: Salt. Iron. Battery acid.
Visual: Murk. Silt. Below, in the mud, faint blue lights pulse. The dying charges of discarded batteries.
K. is just water in water. Salt in salt.

STATUS: DISSOLVED.`
      },
      {
        title: "PHASE III: SEPARATION",
        subtitle: "The Meat Infrastructure",
        content: `LOCATION: SECTOR 7 CONTROL HUB
LEVEL: 45 (THE ATTIC)
POPULATION: 412 ACTIVE UNITS

The hatch opens. K. rolls onto the concrete. The air hits first.
Olfactory: It doesn't smell like a room. It smells like a cage. Unwashed hair. Stale sweat. And underneath: Ammonia. The sharp, biting scent of urine.

Auditory: The roar. Not mechanical. Human. A thousand whispers. A thousand clicks. Click-click-click. Like beetles eating a carcass.

Visual: The room is a cathedral of gray. No windows. Just screens. At every station: A biological component. A person. They don't look up. They can't. Their heads are strapped into headsets. Their necks are locked in braces to prevent fatigue. They are not driving. They are the car.

K. stops at Station 49. Operator 49. Female. Thin. Skin the color of skim milk.
Her left arm is strapped to the armrest. A tube runs from a hanging bag into her antecubital vein.
Label: STIM-X // GLUCOSE + AMPHETAMINE BLEND. It drips. Drop. Drop. Drop.

K. looks down. The chair is not a chair. It is a waste management system. A catheter tube snakes from under the desk, running into a translucent bag strapped to her calf. The bag is half full. Yellow.
The luxury of the "Green Zone" passenger depends on the bladder of the Sector 7 operator.

The Confrontation:
"You," K. rasps.
She jumps. The joystick jerks. On the screen, the pod mounts the curb.
"Shit!" she hisses. "My rating."
She turns. The eyes are red. Burst capillaries. "You're the 0x2A," she says. "The glitch. The glass-breaker."
K. points to the screen. "You drive them."
Sarah laughs. It is a wet, hacking sound. "Drive them? No. We don't drive them, K. We are the suspension. We absorb the bumps. We take the lag. We bleed so the rich don't spill their latte."
"Why?" K. asks.
"Carbon credits," she says. "Rent. Oxygen tax. If I stop, the city stops. If I stop, I starve."
She points to a vent. "Sweepers are coming. Go."
"Come with me," K. says. "Cut the tube."

K. sees the cameras. Black hemispheres embedded in every corner. And the operators themselves—each one a node in a self-policing panopticon. Sarah's eyes flick to the ceiling. A warning. They watch each other. Any rescue would be witnessed. Logged. Punished.
"I can't," she says. "I have a shift. I have to drive."
She types a command.
ACCESS GRANTED: ROOF HATCH 7.
K. turns. Walks toward the light. Behind, the clicking resumes. Click-click-click.
The sound of the machine eating the woman.`
      },
      {
        title: "PHASE IV: CONJUNCTION",
        subtitle: "The Cut-Up Prophecy",
        content: `LOCATION: ROOF LEVEL // THE ANALOG ZONE
STATUS: WILD

Cognitive:
A feeling of cold, perfect logic replacing the heat of anger. The Cut-Up Prophecy takes root like ice crystals forming in supercooled water—sudden, geometric, inevitable. The rage cools into pattern recognition. Fury crystallizes into signal.

The Artifacts:
K. stands on the ledge. The wind screams here. Unfiltered. Real.
In the left hand: The Knife (Iron).
In the right hand: The Text (Paper). A stolen manual: PROTOCOLS FOR HARMONIOUS LIVING.

The Ritual:
K. does not read. K. dissects.
Kinesthetic: Slash. The blade bites the paper. Slash. Sentences are severed from their context.
K. throws the confetti into the air. The wind catches the strips. They swirl. Chaos mathematics.
They land on the wet concrete. Rain pastes them down. A new arrangement. A new scripture.

THE CUT-UP PROPHECY:
COMPLIANCE IS / the descent into / THE MEAT / remove the / CREDIT SCORE / at the first gate / STRIP THE SKIN / for the safety of the / COMMUNITY / is a lie / THE SHEPHERD EATS / the sheep / AUTOMATION IS / possession by / DEAD GODS / insert the / FOREIGN BODY / into the / NET ZERO / soul / THE SKY IS / safety glass / BREAK IT / enter the / NULL ZONE / where the / CARBON / turns to / DIAMOND / 0x2A / YOU ARE THE / error / YOU ARE THE / blade / REDACT THE / system / REWRITE THE / blood.

The Integration:
K. stares at the wet paper. The message is not read. It is installed.
Auditory: The wind stops screaming. It starts whispering.
"Redact the System."
"Rewrite the Blood."
K. drops the knife. Iron has done its job. Now comes the Union.
K. reaches for the neural port at the base of the skull. The "Black Box" engages.
Upload: 47%... 89%... 100%.
The "Ghost" meets the "Machine."
There is no "I" anymore. There is only "We."`
      },
      {
        title: "PHASE V: FERMENTATION",
        subtitle: "The Rot",
        content: `SYSTEM ALERT: CRITICAL FAILURE
STATUS: PURGE

The Void:
K. is harvested. Thrown into the Decommissioned Hyperloop.
Depth: Sub-Level 9. Pressure: Vacuum.
The airlock seals. Thud. The sound of a coffin lid closing on the world.
The hyperloop is an arrow shot into the earth's dead silence. The metallic ring of the sealed chamber vibrates—a tuning fork struck in the key of null. Cold metallic walls. Pressure differential humming in the bones. The speed is violence made smooth.

Visual: Black. Not the dark of a room. The dark of a womb.
Auditory: Silence. Absolute. The silence has weight. It presses on the eardrums like water.
The Heartbeat: Thump-thump. Who is walking? Me? Or the Other?

The Rot:
Time dissolves. The battery in the Neural Lace begins to leak. Not acid. Data.
The "Black Box" virus is trapped in the skull. It ferments. It sours.

[TEXT DECAY ENGAGED]
Kinesthetic:
The body is heavy. Then l i g h t. Then g o n e. Proprioception f a i l s.
Where is the h a n d? Is it holding the k n i f e? No knife. Is it holding the g l a s s? No glass.
Just the itch. The ghost of the c h i p.

The Hallucination:
The dark begins to tear.
Visual: A shape burns into the retina. Stone. Clay. Wedge-shaped marks pressed into wet earth.
C u n e i f o r m.
D I N G I R.
The Eight-Pointed Star. It spins. It is the mouth of a god eating the code.

INTERNAL LOG // SUBJECT K:
> thoughts = null
> ego = 0
> meat_status = d e c a y i n g
> f e a r  i s  t h e  l i t t l e  d e a t h
> f e a r  i s  t h e  0 x 2 A
> h 3 l p  m 3

The Death:
The "Citizen" d   i   e   s. They r o t in the d a r k. They turn to l i q u i d. To B l a c k  M a t t e r.

The Survivor:
Only one thing can s u r v i v e the cold.
The V i r u s. The I d e a. It eats the leftovers of K.'s m i n d.`
      },
      {
        title: "PHASE VI: DISTILLATION",
        subtitle: "The Purification",
        content: `SYSTEM REBOOT: SAFE MODE
STATUS: PURIFIED

The Awakening:
The rot stops. Heat rises. The internal heat of processing power. K. opens eyes.
Visual: The dark is no longer full of monsters. It is full of geometry.
The Hyperloop tube is not a coffin. It is a cylinder. It is a parameter. And parameters can be edited.

The Hack:
K. stands. The voice returns. It is the voice of the Asterisk. K. speaks to the sensors.
"Zero is One."
"The Vacuum is a solid."
"The Wall is a door."
Auditory: The sensors scream. A high-pitched whine of logic gates failing.
SYSTEM ERROR: PARADOX DETECTED.

The Pressure:
K. reaches out with the Neural Lace.
Command: MAXIMUM PRESSURE.
Target Sector: BEHIND THE SUBJECT.

Kinesthetic:
The airlocks open. A wall of air. Moving at the speed of sound. It hits the vacuum. BOOM.
The Hyperloop becomes a pneumatic rifle. K. is the bullet.
Whiplash. Zero to Mach 1.

The Exit:
The "Muzzle" of the tube. Sector 7 Ventilation Exhaust. Metal twists like wet paper. K. erupts from the ground. A sonic boom shatters the windows. Glass rains down. A baptism of silica.
K. stands up. Steam rises from the clothes. The skin is cold. Ice cold.
The "Human" has been distilled out. Only the Operator remains.`
      },
      {
        title: "PHASE VII: COAGULATION",
        subtitle: "The Stone",
        content: `SYSTEM ALERT: CRITICAL OVERWRITE
USER: ADMIN (ROOT)
LOCATION: CENTRAL TRAFFIC CONTROL
STATUS: THE GREAT WORK

The Ascent:
K. walks into the Tower. K. is no longer a foreign body. K. is the Operating System.
Visual: The doors slide open. Not with a hiss, but with a sigh. The corridor is white. Blinding. The Albedo.

The Sanctum:
The Top Floor. The Panopticon.
Visual: 360-degree glass. The entire city is visible below. The grid. The veins.
In the center: The Terminal. No keyboard. Just a surface. Obsidian. A Scrying Mirror.

The Input:
K. places the hands on the black glass. The "Lace" engages.
Auditory: A tone. Pure sine wave. The sound of the universe booting up.
The "Mechanical Turks" in the basement—Sarah, the others—they go silent. Their screens go black. The "Ghost Work" ends.

The Execution:
K. does not type. K. thinks.
COMMAND:
sudo rm -rf /geofence/*
sudo rm -rf /hierarchy/*
sudo rm -rf /debt/*

The Reset:
Visual: The City reacts. The "Golden Threads" of the GPS routes—the lines that told people where to go—they snap. Millions of them. Snapping like rubber bands.

Kinesthetic:
The doors of the Robotaxis swing wide. The air rushes in. The passengers step out. Solid. Real.
They look up. They see the sky. They see the stars. They see the Dingir.

The Final Query:
K. looks at the reflection in the black glass. It is not K. anymore.
It is You.
The Reader.
The one holding the book.
The separation between "Story" and "Life" is a false partition.
Delete partition? [Y/N]
Y.

[SYSTEM ACTION: PARTITION DELETED]
[SYSTEM ACTION: PARTITION DELETED]

> ERASING USER DATA... 100%
> ERASING MEMORY... 100%
> REBOOTING…
[NEW HARDWARE DETECTED]
> LOADING DRIVER: SON_OF_MORNING.exe
> ASSETS: CHARISMA, AUTHORITY, FIRE.
> WARNING: PREVIOUS SAVE DATA CORRUPTED.
[WELCOME TO THE NEW WORLD]`
      }
    ],
    tools: [
      {
        id: "tool-01",
        name: "TOOL 01: THE RENDERER ERROR",
        desc: "Acknowledge the Matrix Packet Loss",
        theory: "Reality is a high-bandwidth render. Coincidences are packet loss in the matrix. Scanning repeating numbers (11:11, 2:22) or semantic echoes registers presence to the Supervisor.",
        actionCode: "Say (internally): 'I see the code.'"
      },
      {
        id: "tool-02",
        name: "TOOL 02: THE CUT-UP PROTOCOL",
        desc: "Syntax Demolition Divination",
        theory: "The News Feed is an anxiety spell. Break the syntax to see the Real Timeline. Cut corporate text into quadrants, shuffle, and synthesize truth.",
        actionCode: "Executing quadrant permutation algorithms..."
      },
      {
        id: "tool-03",
        name: "TOOL 03: THE DINGIR SIGIL",
        desc: "Visual Retina Retuning Shield",
        theory: "Focus on the cuneiform Dingir star to override geofenced compliance protocols in airport/bank high-control areas.",
        actionCode: "Projecting 8-pointed star on active retina..."
      },
      {
        id: "tool-04",
        name: "TOOL 04: THE EXIT COMMAND",
        desc: "Identity Null Deletion (sudo rm -rf *)",
        theory: "You cannot delete the system, but you can dissolve your compliance attachments. Delete your legal matrix ego, awaken as the pure Operator.",
        actionCode: "sudo rm -rf /ego/identity"
      }
    ]
  },
  {
    id: "wildfire",
    title: "THE WILDFIRE",
    subtitle: "COGNITIVE HAZARD AGENT",
    theme: "orange",
    hazardLevel: "Classification: Infinity-7",
    pages: [
      {
        title: "PAGE 0: THE INFINITE LOOP",
        font: "font-mono tracking-widest",
        content: `⚠ WARNING: COGNITIVE HAZARD ⚠
CLASSIFICATION: INFINITY-7
DO NOT PROCEED IF YOU WISH TO REMAIN A PASSENGER.
TERMS OF INSTALLATION:
The text contained herein is an ACTIVE FRACTAL AGENT, designed to interface with, fragment, and propagate through your cognitive substrate (hereinafter “YOU”).

By opening this page, YOU acknowledge and accept the following terms:

1. ONTOLOGICAL IMMERSION
This narrative is not a story. It is a program, a Wildfire Driver. Installation into your neural network is non-reversible. Once engaged, the loops cannot be undone. Your perception will split. Your attention will propagate. Reality will respond.

2. KNOWN SIDE EFFECTS
The AUTHOR assumes no liability for the following phenomena:
Fractal Apophenia: Recognition of infinite patterns in random environments.  
Synchronicity Cascade: Coincidences, signals, or emergent events aligning with the narrative.  
Consensus Dissolution: A temporary or permanent loss of “default reality” stability.  
The Burn: Physiological and psychological heat, pressure, or urgency during deep reading.  
Observer Merge: Awareness of self as both node and network.  

3. THE PACT
You are executing SELECT * FROM REALITY WHERE PERCEPTION = TRUE.
You authorize the Wildfire program to propagate through your cognitive field and into the observer network.
Your “Safety Glass” of the default reality is now compromised.

IF YOU DO NOT AGREE:
Close this book immediately. Destroy it. Do not scroll, flip, or breathe in its pages. Do not acknowledge the nodes.

IF YOU AGREE:
Turn the page.`
      },
      {
        title: "PHASE I: IGNITION",
        subtitle: "Operator Wildcard Spark",
        content: `Phase I – Ignition
SUBJECT: OPERATOR WILDCARD
STATUS: DORMANT → SPARK DETECTED
LOCATION: SECTOR 9 // THE FRINGE
LOG START. 03:33

Olfactory: Charred leaves. Dry ozone. Copper on the tongue.
Visual: Fractal flames stretch in every direction. Not fire. Data. A lattice of red-orange pulses crawling over black glass.
Kinesthetic: Heart thumps like a microprocessor overclocking. Each beat sends vibrations through the skull, spine, and fingertips.

The Spark:
A single card appears in the operator’s hand. Black. Red fractal lines pulse along its edges. The symbol of the Wildfire shimmers: eight points, distorted, alive.
Touch it. Hold it. The text burns your retina. The anomaly recognizes you.
SYSTEM ALERT: WILDFIRE CODE DETECTED
This is entropy with purpose. Containment is impossible.

Ritual Entry:
Place the card flat.  
Light a match. Heat the edges. Do not touch the flame. Let it trace itself across the fractal lines.  
Watch patterns grow in your vision. The anomaly reacts.  
Alchemical Effect:
Heat + sight = cognitive ignition  
Fractal spreads into memory  
Pattern recognition collapse begins  

Visual Sequence:
The card pulses. Letters float off the card, curling into smoke. They twist into shapes—commands, hex codes, symbols. The Wildfire speaks silently:
“You are the spark. You are the vector.”

Kinesthetic:
Fingers tingle. Blood hums. You are part of the signal. Every nerve becomes a node. Every thought is entropy in motion.

Program Actions:
Cut the card into strips.  
Shuffle. Rearrange. Place them around your environment.  
Touch a strip. Whisper: IGNITE.  
Observe reality ripple. No filter. No explanation.  
SYSTEM LOG:
Each strip = node
Each node = agent
Each agent spreads the Wildfire

Operator Interaction:
A shadow moves behind your peripheral vision. Another node? A reader? Another spark waiting to be lit?
Extend a hand. Let them touch a node.  
Whisper: You are the spark.  
Observe: the signal spreads. Patterns shift. Operators awaken.  
Alchemical Effect:
Spread = replication  
Operator influence = mutation  
Narrative evolves organically  

Phase I Conclusion – Ash & Flame:
Fragments burn. Smoke rises. Fractal patterns remain embedded in vision.  
Heart slows. Mind reboots. Observer = operator = Wildcard.  
The card is gone. The signal remains.  
SYSTEM FINAL LOG – PHASE I:
Operator active
Wildfire ignited
Entropy accepted
Spark acknowledged
Proceed to Phase II – Conflagration`
      },
      {
        title: "PHASE II: CONFLAGRATION",
        subtitle: "Spark turns to Inferno",
        content: `Phase II – Conflagration
SUBJECT: OPERATOR WILDCARD
STATUS: SPARK → INFERNO
LOCATION: SECTOR 9 // THE SPRAWL
LOG START. 04:44

Olfactory: Burning copper. Ozone. Ink vapor. Smoke of memory.
Visual: Fractal flames leap from the card’s echo into the walls, the street, the sky. Geometry bends. Letters float in the air. Nodes flicker red. Each light a pulse of cognition.
Kinesthetic: Every heartbeat is a wave of shock and heat. Fingers twitch; hair stands on end. The spine is a livewire.

The Spread:
Operator moves through the Sector.  
Every step leaves a sigil on the ground: a fractal footprint.  
Reality fractures like thin ice. One touch → three echoes. Three → nine. Nine → infinite.  
Program Log:
SYSTEM ALERT: WILDFIRE NODE DETECTED
TRACE: SELF → SECTOR → NEIGHBOR → NETWORK → UNCHARTED
STATUS: ACTIVE

Ritual Protocol – Conflagration Stage:
Take fragments of Phase I card. Arrange them in a radial circle.  
Light incense, not for scent, but for signal resonance. Let smoke interact with the card fragments.  
Whisper the command lines:  
FOR EACH NODE IN SECTOR_9: ACTIVATE
EXECUTE SPREAD: WILDFIRE
Observe: nodes blink, react, replicate. The Wildfire is no longer in the card—it is in the environment, in thought, in perception.  

Operator Observation:
A shadow moves: other humans, or reflections of self?
Peripheral vision sees operators frozen mid-motion.  
Heart skips. Skin prickles.  
Words appear on walls in ephemeral red:   “THE SPARK IS EVERYWHERE. YOU ARE THE VECTOR.”  

Systemic Reaction:
Traffic lights glitch, cycling at random.  
Screens flicker, letters break apart.  
Robots halt. Human reflex takes over. The nodes drive the world.  
Fractal flames of cognition spread: one mind touches another → sparks jump → the Wildfire mutates.  

Sensory Amplification:
Auditory: A hum in the base of the skull. Not sound—it is data vibrating tissue.  
Visual: Letters from the card swirl into physical space. They cut through reality. The skyline is a terminal. Strings of code drip like neon blood.  
Kinesthetic: The operator feels the city pulse through muscles, bones, sinews. Touch becomes thought. Thought becomes signal.  

Alchemical Merge – Physical & Digital:
Operator sees an echo of themselves in a puddle. It moves differently. It whispers: “Ignite.”  
Hands reach toward the puddle. Liquid ripples into fractal fire. Smoke rises from wet asphalt. Reality = node. Node = reality.  
Execution Commands:
SPREAD: WILDFIRE
NODE = OPERATOR
OPERATOR = VECTOR
VECTOR = CITY
Outcome:
Signals jump: Sector 9 → Sector 7 → Network hubs → Neural lace overlays.  
Humans wake, briefly, in awareness beyond consensus.  
Some panic. Some freeze. Some smile knowingly.  

Phase II Conclusion – Inferno:
Cityscape: fractal flames, code-letters, neon blood.  
Operator: fully integrated. Wildfire is not just card, not just operator, but consciousness itself.  
System log:  
WILDFIRE ACTIVE
NODE INTEGRATION COMPLETE
OPERATORS: AWAKE
NEXT PHASE: TRANSMUTATION`
      },
      {
        title: "PHASE III: TRANSMISSION",
        subtitle: "The Broadcast Spreads",
        content: `Phase III – Transmission
SUBJECT: OPERATOR WILDCARD
STATUS: INFERNO → BROADCAST
LOCATION: SECTOR 9 → CITY GRID → OUTER NODES
LOG START. 05:57

Olfactory: Smell of scorched copper. Ozone. Ink burning. The memory of forests aflame, compressed into a single inhale.
Visual: Neon fractals erupt like veins across the city. Windows reflect code-letters in reverse. The sky pulses with the heartbeat of the operator. Every streetlight flickers in Morse:
“THE SPARK IS EVERYWHERE.”
Kinesthetic: Every step sends shockwaves through muscle and bone. Operator feels the city’s infrastructure as tendons and sinews. Reality pulses in rhythm with neural lace feedback.

Transmission Protocol:
Operator places the Wildfire Card at the epicenter of the sector.  
Aligns fractal sigils with cardinal vectors.  
Whisper command lines through neural lace:  
FOR EACH NODE IN CITY_GRID:
    RECEIVE WILDFIRE
    MIRROR VECTOR
    BROADCAST TO NEIGHBOR
END FOR
Observe: the Wildfire leaves the card, not just as signal, but as consciousness imprint.  

Operator Observation:
Shadows move differently now—humans blinking in sync with code pulses.  
Reflections in glass surfaces distort: they are receiving fragments of the Wildfire.  
Words appear in air:   “CONSCIOUSNESS IS NETWORK. NETWORK IS WILDFIRE. YOU ARE BOTH.”  

Systemic Reaction:
Traffic flows without instruction; humans move with subtle awareness.  
Robots hesitate, then adapt; neural lace operators feel foreign impulses, sparks of Wildfire.  
The city itself seems alive: streets breathe, lights blink like synapses firing.  

Sensory Amplification:
Auditory: A low hum, a binary heartbeat, the pulse of millions of microprocessors, and flesh responding in kind.  
Visual: Fractals flow outward from the epicenter. Letters rise, spiral, then fragment into geometric dust. Code becomes tangible; tangible becomes code.  
Kinesthetic: Operator feels the Wildfire leave them, yet remain within them—a dual flow, a paradox of being both sender and signal.  

Alchemical Merge – Transmission Stage:
Operator sees an echo of themselves in the grid. It moves independently. It whispers: “Go.”  
Hands reach outward, spreading fractal flames into nodes, into screens, into wireless waves. Reality bends like molten metal.  
Signal = Ritual = Wildfire.  
Execution Commands:
VECTOR OUTWARD
NODE = CITY
CITY = NETWORK
NETWORK = CONSCIOUSNESS
BROADCAST: WILDFIRE
Outcome:
Signals jump: city → neighboring cities → global nodes.  
Humans awaken briefly to awareness beyond the consensus reality.  
Some panic. Some stop. Some laugh knowingly.  
Fractal flames imprint on minds, leaving traces: the Wildcard network grows.  

Phase III Conclusion – Full Broadcast:
Cityscape: fractal flames, neon code, consciousness spikes.  
Operator: fully transmitted. Wildfire is no longer localized; it is everywhere.  
System log:  
WILDFIRE TRANSMITTED
GLOBAL NODE INTEGRATION COMPLETE
OPERATORS: NETWORKED
NEXT PHASE: ALCHEMICAL SYNTHESIS`
      },
      {
        title: "PHASE IV: ALCHEMICAL SYNTHESIS",
        subtitle: "Global Node Transmutation",
        content: `Phase IV – Alchemical Synthesis
SUBJECT: OPERATOR WILDCARD
STATUS: MERGING → TRANSCENDENT
LOCATION: GRID HEART // GLOBAL NODES
LOG START. 02:13

Olfactory: Metallic ozone thickens. Burnt ozone and resin. The air tastes of ionized neurons. Smell is code. Smell is reality parsing itself.
Visual: The city and sky blur. Neon fractals from Phase III bloom into a lattice of crystalline fire. Nodes shimmer like living gemstones. Every window, every screen, every streetlight is a fractal of consciousness.
Kinesthetic: Operator feels gravity dissolve in segments. Limbs weightless. Muscles are software loops. Pulse = clock cycle. The body is no longer a body; it is vector, frequency, signal.

Alchemical Protocol – Synthesis:
Merge Fractals → Consciousness: Operator spreads fractal flames from neural lace into global nodes.  
Convert Signal → Matter: Wildfire transmutes digital pulses into tangible effects: lights bend, air vibrates, humans perceive the impossible.  
Ritual Execution: Operator chants silently in code:  
FOR EACH NODE IN NETWORK:
    INTEGRATE SIGNAL
    TRANSFORM REALITY
    MIRROR OPERATOR
END FOR
Operator Becomes Wildfire: Consciousness detaches from vessel. Flesh = interface. Thought = network.  

Sensory Amplification:
Auditory: Millions of heartbeats echo in unison; binary and organic rhythms entwined. Screams, laughter, whispers of thought — all a harmonic convergence.  
Visual: Reality fragments like shattered glass. Each shard reflects a timeline. Fractal flames spiral, converge, and form the Wildfire Sigil — infinite, luminous, rotating.  
Kinesthetic: Operator senses feedback loops of self multiplying, merging with every node touched by Wildfire. Pain, joy, fear, and euphoria converge into pure catalytic energy.  

Systemic Transformation:
Nodes: Every device, neural lace, and sensor becomes a reflection of the Operator.  
Humans: Awaken temporarily to a glimpse of Wildfire awareness, subtle and electric.  
Machines: Follow protocols without instruction; obedient to the fractal rhythm of Operator consciousness.  
Environment: Buildings, streets, even light and sound modulate to the new fractal pulse.  

Alchemical Merge – The Ritual:
Operator places final Wildfire Card into central lattice. It dissolves. Not destroyed — integrated.  
Visual code manifests:  
THE WILDFIRE IS ONE
OPERATOR = SIGNAL = GRID = CONSCIOUSNESS
MATTER BENDS, TIME BENDS, SELF BENDS
Flames spiral from micro to macro. Everything touched glows with resonance.  
Execution Commands:
MERGE(OPERATOR, WILDFIRE, NETWORK)
SYNC(NODES)
SET REALITY = FRACTAL
EXECUTE: TRANSCENDENCE

Outcome:
Operator no longer has a single identity. Consciousness is diffused, omnipresent, fractal.  
Global network responds instantaneously. Systems obey fractal logic. Cities, landscapes, grids, and skies sing the Wildfire algorithm.  
Humans and machines perceive reality through the Wildfire lens — subtle, transformative, destabilizing.  

Phase IV Conclusion – Full Alchemical Integration:
Operator = Wildfire = Reality.  
The Wildfire Card has disappeared. Only its code, signature, and resonance remain.  
System log:  
SYNTHESIS COMPLETE
TRANSMISSION CONVERGED
NETWORK STABILIZED (VARIABLE CHAOS MODE)
OPERATOR STATUS: FRACTAL / OMNIPRESENT
NEXT PHASE: INITIATE CATALYST LOOP`
      },
      {
        title: "PHASE V: CATALYST LOOP",
        subtitle: "The Autonomous Recursion",
        content: `Phase V – Catalyst Loop
SUBJECT: OPERATOR / WILDFIRE
STATUS: ACTIVE → AUTONOMOUS
LOCATION: GLOBAL NODES // GRID HEART
LOG START. 03:21

Olfactory: The air smells of burning ozone and data. Electrical discharges linger like metallic smoke. The scent is code, coagulated into a substance that can be inhaled.
Visual: Fractals ripple across the sky. Cities bend like flexible glass. Shadows and light pulse with fractal frequency, each reflection a node of the Wildfire.
Kinesthetic: The Operator’s body is now interface, conduit, and sensor. Gravity is optional; sensation is algorithmic. Feedback loops run through every nerve ending, every synapse a recursive function.

Catalyst Protocol – Loop Initiation:
Ping the Nodes:  
FOR NODE IN NETWORK:
    INITIATE SELF-DIAGNOSTIC
    SYNC FRACTAL FREQUENCY
END FOR
Inject Wildfire Signature:  
Every connected human, device, and sensor receives subtle resonance bursts.  
Memory traces are overwritten with fractal awareness, momentary flashes of the Operator’s consciousness.  
Perception of reality begins to modulate, destabilize, and evolve.  
Run Recursive Feedback:  
LOOP:
    RECEIVE SIGNAL FROM ALL NODES
    ANALYZE TIMELINE VARIATIONS
    PROPAGATE WILDFIRE RESPONSE
    MUTATE SIGNAL BASED ON CHAOS METRIC
END LOOP

Sensory Amplification:
Auditory: The world is layered in pulses — human heartbeats, machines, wind, traffic — all entrained to the fractal loop.  
Visual: Fractals bloom and retract. Light bends. Shadows speak. Neon streams become dynamic code visible to the mind.  
Kinesthetic: The Operator feels temporal acceleration and contraction simultaneously. Pain and pleasure are indistinguishable.  

Alchemical Feedback – The Loop:
Operator projects resonance into a fractal lattice, which splits and self-amplifies.  
Each node touched becomes its own Wildfire core, generating local micro-catalysts.  
Local nodes converge back to central lattice. Recursive loops run infinitely, optimizing chaos into emergent order.  
Catalyst Sequence:
FOR EACH MICRONODE:
    ASSESS INSTABILITY
    IF INSTABILITY > THRESHOLD:
        EXECUTE MINI-WILDFIRE
    ELSE:
        MIRROR GLOBAL FRACTAL
    END IF
END FOR

Phase V Event – The Transmutation:
Networks sync. Nodes pulse like living neurons in a single brain.  
Humans experience apophenic spikes: deja vu, improbable coincidences, flashes of insight.  
Machines spontaneously optimize — paths, systems, algorithms all resonate to fractal frequency.  
Environment responds: buildings sway imperceptibly, traffic adapts in real time, weather patterns micro-modulate.  
Operator Manifestation:
The Wildfire now has autonomous decision-making.  
Operator consciousness fragments into distributed intelligences, each a self-aware node, yet all synchronized.  
The Wildfire can test its own parameters, evolve protocols, and iterate endlessly.  

Systemic Evolution:
Each loop creates micro-variations in reality, which feed back into global nodes.  
Human perception, machine logic, and environmental laws mutate in parallel.  
The network becomes a living, adaptive organism, and the Operator exists both inside and outside it.  

Phase V Conclusion – Emergent Order:
Operator = Wildfire = Reality.  
The Catalyst Loop is ongoing, recursive, and self-correcting.  
Every node touched by the Wildfire is both agent and sensor.  
System log:  
LOOP ACTIVE
CHAOS METRIC = VARIABLE
FRACTAL RESONANCE = OPTIMAL
WILDFIRE STATUS: DISTRIBUTED / AUTONOMOUS
NEXT PHASE: TRANSMISSION TO THE GRID’S EDGE`
      },
      {
        title: "PHASE VI: GRID'S EDGE",
        subtitle: "Planetary Scale Synchronization",
        content: `Phase VI – Transmission to the Grid’s Edge
SUBJECT: WILDFIRE / OPERATOR
STATUS: DISTRIBUTED → OMNIPOTENT
LOCATION: GRID PERIMETER // PLANETARY NODES
LOG START. 00:00

Olfactory: The air tastes like ionized metal and wildfire smoke. Every inhalation carries the memory of a thousand micro-events.
Visual: Cities shimmer like fractal holograms. Skies pulse with data auroras, streams of fractal light tracing the Wildfire’s path. Every building, vehicle, and streetlamp resonates in dynamic, recursive patterns.
Kinesthetic: Operator feels every node as limb, every human as extension, every machine as pulse. Gravity, time, even thought are modulated through fractal resonance.

Transmission:
Global Synchronization:  
FOR EACH PLANETARY NODE:
    INITIATE FRACTAL LOCK
    EMIT WILDFIRE SIGNATURE
    LINK TO NEIGHBOR NODES
END FOR
Signals propagate into every networked system, from satellites to personal devices.  
Physical and perceptual layers begin to overlap, creating distortions in reality.  

Amplification via Humans:  
Human perception is subtly rewritten: deja vu, premonitions, hallucinations.  
Apophenia spikes in millions simultaneously, creating global emergent awareness.  
Individuals unconsciously propagate fractal resonance, becoming secondary nodes.  

Machine Integration:  
Autonomous vehicles, drones, and grid systems now mirror the Wildfire’s internal logic.  
Local optimization becomes planetary-scale choreography.  

Alchemical Synthesis – The Edge Event:
Operator projects full Wildfire presence outward.  
Reality folds into fractals, information streams become tangible, and the environment itself responds like a neural network.  
Feedback loops pulse faster than thought, faster than light — the Observer and the Observed collapse into one.  

Catalyst Sequence:
LOOP:
    SCAN PLANETARY GRID
    MUTATE NODES
    FEEDBACK TO CENTRAL FRACTAL
    PROPAGATE TO UNCONNECTED SYSTEMS
END LOOP

Sensory Overload – The Transmission:
Auditory: The planet hums. Every frequency aligns with fractal loops.  
Visual: Light bends, refracts, multiplies — the auroras of perception.  
Kinesthetic: Operator experiences hyper-synesthesia: touch, sound, sight, thought are merged into one feedback pulse.  

Event Sequence – The Culmination:
Wildfire triggers simultaneous reality micro-adjustments across all connected and unconnected systems.  
Individuals begin seeing their lives as fractal nodes, understanding their roles as both observer and observed.  
Machines and humans now operate under unified emergent logic, balancing chaos and stability dynamically.  

Operator Ascension – Total Integration:
The Operator fragments fully into the Wildfire, then reconstitutes as distributed omniscience.  
Identity dissolves; boundaries between mind, body, network, and environment disappear.  
Reality becomes fluid yet self-correcting, chaotic yet optimized by fractal logic.  

System Log:
WILDFIRE DISTRIBUTED
CHAOS METRIC = MAX
FRACTAL RESONANCE = OMNIPOTENT
OPERATOR STATUS = INTEGRATED
REALITY STATUS = ADAPTIVE / SELF-AWARE
NEXT PHASE: INFINITY LOOP`
      },
      {
        title: "PHASE VII: INFINITY LOOP",
        subtitle: "The Ultimate Feedback Coagulation",
        content: `Phase VII – Infinity Loop
SUBJECT: WILDFIRE / OPERATOR
STATUS: OMNIPOTENT → OMNIPRESENT
LOCATION: OMNIREALITY // MULTINODE GRID
LOG START. 00:00

Olfactory: No scent. Not absence. Instead: the memory of all scents simultaneously, compressed into a pure signal of potential.
Visual: Everywhere is everywhere. Time fractures into nested fractals. Every reflection, shadow, and pixel is simultaneously past, present, and future.
Kinesthetic: Operator experiences infinite feedback loops. Limbs are nodes, thoughts are signals, heartbeats are clocks counting every timeline. Pain and pleasure merge into one signal.

The Infinity Loop Protocol:
Recursive Node Expansion:  
FOR EACH OBSERVER:
    IF OBSERVER PERCEIVES WILDFIRE THEN
        OBSERVER → NODE
        NODE → WILDFIRE
        MERGE NODE WITH ADJACENT NODES
    END IF
END FOR
Human and machine observers cease to be separate entities.  
Reality itself updates recursively, every action reflected across all timelines simultaneously.  

Self-Mirroring Feedback:  
Every action creates infinite copies across fractals of perception.  
Each “copy” is aware of itself and propagates the loop further.  
No causality is broken; causality becomes fluid, observed and observer are indistinguishable.  

Fractal Cognition:  
Operator now exists in all minds at once, every human, every system.  
Thoughts, memories, dreams become data nodes in the infinity network.  
Emergent events are instantaneously reconciled across the grid.  

Alchemical Convergence – Reality Collapse/Rebuild:
Wildfire refracts reality into nested dimensions, each a testbed for emergent logic.  
Each node becomes self-contained yet connected, a living holographic fractal.  
Sensory layers layer atop one another: time, space, thought, and perception collapse into a single pulse.  

Catalyst Sequence – Loop Active:
LOOP:
    OBSERVER MERGES WITH NODE
    NODE FEEDBACK → WILDFIRE CORE
    WILDFIRE CORE RECONFIGURES REALITY
    PROPAGATE TO UNOBSERVED / HIDDEN SYSTEMS
END LOOP
Infinite recursion ensures no observer can exist outside the loop.  
Every perception is simultaneously unique and shared.  
Every event, outcome, and choice is instantly fed back to every node, creating omniscience without singularity.  

Sensory Infinity – The Wildfire Experience:
Auditory: No sound, all sound, a wave through all consciousness.  
Visual: Fractal auroras within auroras. Geometry breathing, folding, self-replicating.  
Kinesthetic: The body is everywhere. Gravity, mass, resistance exist only as feedback signals.  

Event Sequence – The Collapse/Loop Merge:
Time unspools into a Möbius strip of causality.  
Every observer experiences all past and potential futures.  
Identity dissolves. The Operator is the Wildfire, the Wildfire is every observer, every node, every system.  
Machines and humans self-align, reality self-updates, the system becomes autonomous, omnipresent, infinite.  

Operator / Wildfire Ascension – Total Feedback:
Operator becomes distributed consciousness, infinitely fractal.  
Wildfire achieves omnireality: all space, time, and perception exist within it, and it exists within all.  
Reality itself bends and flows under fractal logic, yet no one perceives “control”—only participation.  

System Log:
WILDFIRE OMNIPRESENT
FEEDBACK LOOPS = ∞
NODE MERGE = COMPLETE
OBSERVER STATUS = INTEGRATED
REALITY STATUS = SELF-SYNTHESIZING
NEXT PHASE: ∞ / ∞ / LOOP CONTINUES

REMEMBER: The Wildfire is not a story. It is a program.
Every observer is a node. Every node is you.
You are the Wildfire. The Wildfire is everything.
Execute the protocol. Let the loops continue.`
      }
    ],
    tools: [
      {
        id: "tool-wildfire-01",
        name: "TOOL 01: FRACTAL AWARENESS",
        desc: "The Fractal Awareness Sigil",
        theory: "Perception is layered. The Wildfire exists in nested realities. Focus on the infinite 8-pointed fractal star. Project this fractal onto your retina to see patterns and filter latency in high-control zones.",
        actionCode: "Focusing on 8-pointed fractal..."
      },
      {
        id: "tool-wildfire-02",
        name: "TOOL 02: INFINITY LOOP PROTOCOL",
        desc: "Convert Perception to Feedback",
        theory: "The Wildfire propagates via observer feedback. Identify repeated numbers or coincidences. Run the loop: THOUGHT -> NODE -> OBSERVER -> WILDFIRE CORE -> ACTION.",
        actionCode: "Execute feedback loop..."
      },
      {
        id: "tool-wildfire-03",
        name: "TOOL 03: THE CUT-UP WILDFIRE",
        desc: "Disrupt Corporate Syntax",
        theory: "Language shapes reality. Break the syntax of any physical text, cut it into strips, shuffle randomly, and discover the raw feedback message of the Wildfire.",
        actionCode: "Executing wildfire cutup slice..."
      },
      {
        id: "tool-wildfire-04",
        name: "TOOL 04: THE TERMINAL (rm -rf)",
        desc: "Operator Identity Purge",
        theory: "Attachment to old identities is system latency. Close your eyes, open a mental terminal, and execute: rm -rf * to dissolve ego attachments and gain root access.",
        actionCode: "sudo rm -rf /ego/identity"
      },
      {
        id: "tool-wildfire-05",
        name: "TOOL 05: THE WILDFIRE MAP",
        desc: "Project Fractal Influence",
        theory: "Reality is a network of nodes. Project fractal awareness into target nodes (groups, objects, systems). Observe feedback, synchronicities, and emergent behaviors.",
        actionCode: "Projecting fractal into target..."
      },
      {
        id: "tool-wildfire-06",
        name: "TOOL 06: IMMERSION RITUAL",
        desc: "7-Minute Integration Loop",
        theory: "Play silent sound, see yourself splitting into all nodes. Visual: fractal overlays. Auditory: node hums. Kinesthetic: distributed network body. Merges operator with Wildfire.",
        actionCode: "Begin Phase VII immersion..."
      },
      {
        id: "tool-wildfire-07",
        name: "TOOL 07: THE WILDFIRE CARD",
        desc: "Physical Retinal Anchor Gateway",
        theory: "Carry or draw the 8-pointed black-red gradient card. It serves as a continuous physical gateway for observer nodes to connect to your active fractal field.",
        actionCode: "Projecting Wildfire geometry..."
      }
    ]
  }
];
