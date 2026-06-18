# Building a Glowing Ai GitHub Commit Button

- **Video:** https://www.youtube.com/watch?v=ngsiNEHbIr0
- **Published:** 2025-01-01T00:03:33Z
- **Duration:** 01:21:10
- **Captions:** auto-generated (en)
- **Words:** 4,387

---

appreciate good morning good morning good morning it's Max it's Max vers button and I will not give in let's go good morning good morning we got to get our tweet out we got to let the people know what we're

doing come on let's go there

all right people come on come on now let's pull up the uh to-do list here let's get smart let's get educated about it I get the coffee going my veins all right let's get the status update first okay o

o o it just make it just makes you want to press it look at it look at it makes you want to press this bad boy doesn't it Jesus

oh wow so the issue we have right now okay and then this is uh priority Numero Uno on our to-do list here is that um we need to make the actual green button part a tiny bit a tiny bit smaller there Christian thank you so much brother that means the absolute world to me yes so the button we have to make a tiny bit smaller because it is uh it if you don't hit it top dead center it will hit the uh the the base the key cap will hit the base okay which um which we obviously don't want happening we want a really nice clean key press that way there there's no weird sounds of the uh of the 3D print hitting the um the outside of it all right people let's get it going let's get it rolling joining for people just joining here's where we're at with the

button all right I think it's looking unbelievable it's it's the most clickable thing I've ever seen like when you see it on the desk you instantly just want to click it so um yeah all right to-do list is uh make key cap tiny bit smaller half a millimeter you C smaller half millimeter and then um we have to it's not going to be easy we have to draw schematic for PCB G to be got me a little top we can do it we can do it all right let's get this key cap smaller Morpheus is here yes baby good morning Morpheus how are you doing today are we waking up from the Matrix wake up

Neil here's our new key key uh stems revolutionary

design yes you are bless sir yes you are we're all blessed to be doing it I think you should add text commit I think I should too I think I gotta add your name to it right I got to add your name and I got to say I gotta say push it I think that's a great idea good morning how you doing today all right so um

come on bro little bit bigger

[Music]

oh I'm so shot

today go Max go wait Floren real quick I got to give you the uh I got to give you I got to show you what's up with this I gotta show you this real quick foren oh look at it look at this bad boy go yes yes

it's pretty good it's pretty good right that's the that's the big ass green button yes it is Makoto thank you good morning good morning all right I got to keep going uh yeah so we're going to add we're going to add LEDs to it so it will glow the uh the inside of the button is going to be filled with LEDs we're going to make a custom PCB and uh it'll it'll have backlight and it's going to look sick right now we are making the um

oh my God I just made the button bigger too I'm I'm so shot today damn

it we're making the button a little bit smaller it's tiny bit too big in the closure

no all right that's going to be perfect can't wait for it super cool custom purple version yes we need the purple version of course of course of course go to the desk hub

look at how big this little project has gotten by the way please someone tell me I'm I'm insane thank you thank you good morning have a great day today you're you're a legend your desk cup will be there soon I'll share the uh tracking with you Jesus Christ

okay version 11 of the keycap wow I have to volunteer with the marketing face red smiling to face red smiling live I have to volunteer with the marketing all right volunteer with marketing let's get involved come on do you have um about 8,000 followers on Tik Tok cuz that's what we need right

now again

have you arrived in the name yet or will it be a surprise I have the file name as click it but I don't like it I have not come up with the name yet what is your uh what's your favorite of the names so far happy New Year happy New Year Jacob how you doing today good morning what's your

resolution everyone in here what's your New Year's resolution right now come on I got to hear it

you are with me

I need to put some

uh I wish you best of luck inspiring to see you build the physical products thank you so much I think I think Nobody Does it because they're smart because they're not insane it uh it'll make you go crazy designing physical stuff I guess there's twice as many bugs right you have software bugs and Hardware bugs

now you can just name things go into dead if you have to you can just name things what if we have multiple names for it if I just throw together a couple websites is it really that painful to build it damn uh did you see did you see my file list hold on I'll show you how painful it

is I will show you right now how painful it is

this is how painful it is brother remember these are all designs all right these are all designs and then not only did I design them but I printed them and they didn't work and then I redesigned it and then I printed it and then it didn't work right and we're we're just talking about a button just a button here guys okay we're not talking about catching a rocket with chopsticks this a

button but I love it I love it lot of iterations yes all right New Year resolution ship my very first product ship fast yes let's get a button on your desk and I want to see you 2025 when the product when the the Project's all done slam the button send it into production make your first sale get some r r going big money all right um so this is the scariest part of the whole the whole ordeal here this is a schematic editor right this is where we're going to draw up this is where we're going to draw up the schematic for the PCB you know which is really really

something no

no I think we start with our pins

and we grab some uh how many pins are there in our micr controller I build iOS apps I guess the button won't work with pushing to App Store connect right absolutely it'll work with it so I'm putting a microcontroller in it and uh and you're going to have a small dashboard similar to how desk deskhub has a dashboard to set up up so um we can actually a the button will connect to Wi-Fi um and it'll be able to receive software updates but um we'll actually be able to tell the button uh whatever we want it to do I mean you could hook it up to Philips Hue and have it turn your lights on and off if you want to uh what whatever you can think of doing to your computer you're going to be able to have the button do

how many pses

have it's got nine pins so we need a one by n

we need two of them CU there's two rows of

pins come on

okay it sounds cool to be able to implement on top of the button to create something my own absolutely and that's that's how I build all of my stuff like desk Cub has the API feature so that you can uh you can grab whatever you want on the desk Cub you know I like building Hardware that uh you have full control over and you're not locked into the Matrix I don't know all right what we need to know is we got to we got to get chat gbt involved here because we need to know and I'm all out of credit on on 01 the good chat GPT that's not good extensibility is a great quality yes it is yes it is I think the Indie hacking Community appreciates that because um we're all Builders and we don't want to buy something that we can't mess

with okay okay

God that sucks why do we have to make everything

that's just how it goes you look like Tony Stark Elon must designing this those electric stuff so much cooler than design ux coding Jacob that that makes my whole day all right I'm going to go to work today and think about that comment all day let's grab let's grab a screenshot I'm grabbing a screenshot of that right there you're incredible comment 2024 on the last day

God the the non-pa chat gbt is not good it it messes me up more times than it

helps also they make this uh they make this software difficult on purpose I don't know why but they do

they think it's awesome they think it's

funny all right so we are going from uh gpio Port 4

to ground and the hilarious thing about GPI Port 4 is it's on pin number seven one day when I start designing real stuff not that a button isn't real stuff I'm just going to make [ __ ] that makes sense why are we putting on a

microprocessor pin 4 gpio 4 on right what the [ __ ] all right so what we did right there is we just made our uh that's our microprocessor this right here this header and then um this is going to be our actual ual button itself right and so uh seven will be pulled high with a pullup resistor in software so you can do that you can do that all in software you pull seven high and then um it is connected to ground via the um the uh two which two is ground here and then when you hit the button seven the pull-up resistor will read low because instead of uh being stuck as as high it'll switch to uh to being connected to ground which will um which will make it read low because it's going to make the connection to ground right instead of uh instead of

just there being the signal going back to the microprocessor as reading high and that's your what a time to be alive yes um and that's your basic explanation of that all right and so the switch the switch is actually really easy we need to figure out our um we need to figure out our LED design and um I think that we should go with um

um The W W12 S I forgot what it is

like wb12 what exactly the micro processor does in this case so the microprocessor holds the um the code and uh it's the brains of the operation so when I hit the switch button It'll recognize that the button's been switched and then in this case uh I have it set up to emulate a keyboard right now and so um it's like a smart keyboard and that it can do whatever like I could have it send um okay send a keystroke wait 500 milliseconds send b keystroke wait 500 milliseconds uh send shift don't release shift send uh CBF release shift like you can do whatever you want with it and that's how we're going to get it to um open the terminal go to our project directory and uh make the get commits and also input uh a message with

the commit the microprocessor is uh is critical you know

5050 so that's a 5 mm x 5 mm surface mount device package which means we're going to throw that bad boy right on top of a PCB and um with the pick and place machine and then we'll throw it on a hot plate and it'll solder itself just like the uh microprocessor so we have to throw some of these LEDs into our uh design the thing we're going to need for our LEDs is we're going to need a resistor at the beginning oh thumbs up we're going to need a resistor at the beginning of the circuit maybe we're GNA need a large capacitor definitely at the beginning of the circuit so that um when we have it change colors or change brightness or whatever it doesn't get messed up and then um we're going to have a tiny capacitor right in front of every LEDs

and I almost like to think of those as like just like a little tiny battery back backup for them where uh if something changes or they Peak or whatever they need a little bit more power draw you don't see any flicker because they have that capacitor saving the energy for them right there and it can just boom here you go so let's throw some uh let's throw some of these LEDs in there some 50s these are going to be bright too

we got we got to make sure that we get the right ones here that's going to be

critical those are 2020s we these are 2020s we don't want those we're going to use the big 50/50 these ones are awesome all right um so 5 by five we're going to hit this and then we're going to hit Place repeated copies and then how many 5 by five are we going to have on this thing on this unit so I'm thinking I'm thinking yeah Jacob you should you should try to build something it's good for you all right um I'm thinking that we try to throw in cuz these are only 5 by five okay they're they're not that big like this whole case is 60x 60 okay so I'm thinking we place and the more LEDs we have the better it'll be for diffusion so you won't see like a strong uh LED in one area and not the next so I'm thinking we throw one two three four

in the top and then we try to do three in the bottom there oh we can't do three in the bottom because the microprocessor is going to be right there so we do four in the top and then uh we do two in the bottom we have six in total that's going to be great cuz we'll have plenty of head room for power there let's go let's

go so when we lay it out and the schematic the positioning doesn't matter oops I'm on my face by accident when we lay it out in the schematic the positioning does not matter all right we do need to ask chat GPT here what um a good CU I don't remember what should we use for a cap in front of each LED and what should we use for one on the entire circuit

come on okay filter no we know what we know what they're for all right yes a point UF ceramic

come on

now so the really nice thing about a ceramic cap not an electro electrolytic cap a ceramic cap is that um with the ceramic cap they are um there's no polarity so for someone like myself who has no idea what they're doing uh it's hard to mess them up right

0402 baby this is the bad boy we need right here yes do you already have the LEDs at home the LEDs are on the way they're uh they're coming from uh China right now I think that I have a thousand of them coming and they're going to come on a big uh real like a huge tape that'll get put into my pick and place machine all right 4020 Let's uh let's grab these come on we got to keep going

oh this is an 0402

we want the surface mount

version this was really hard for me to wrap my head around but uh the capacitors are going to bridge ground and uh VCC so it's going to bridge 5 volts and ground right before the um right before the

LED we need a resistor for data

oh

this is going to turn into a mess very quickly

I think that I think that this uh th farad capacitor or whatever it is is going to be a 1210 size but I will fix it if it's not I just want to get going with this because it's already 611 okay so um let's do um let's do data first and then we'll do uh voltage and ground so um

grab a chip here as well do you already yeah as well the microprocessors yeah I have like only 100 of the microprocessors at home though because those are a little bit more

expensive those also come from China

all right so this is data it's going to go in it's going to come out of the GPI o Port uh three and then uh go into this resistor right here uh this 30 330 Ohm resistor and then it's going to go into Data n and then uh out data out pretty simple

setup remember all we're doing is drawing the schematic this is nothing positional so this is like writing the backend code without um without having any front end code and all I did right there was just told the schematic that that ends that ends right there data data in data out okay and then um we have to supply the power which uh power is going to be on five volts is right here oops that's about

I don't think we need one okay we do not need one God if I do that one more time okay all right so we're going out of five volts right here

this is probably unfortunately going to be an electrolytic capacitor so we are going to need What's the title of the soundtrack the soundtrack is white bat uh white bat vibrant 80 synth wve playlist gets me AB absolutely fired up out of my mind

okay so we have to hit one leg of the capacitor before going in to voltage

in I mean it's simple stuff but it's also not at all that makes sense it's simple stuff but it's also very infuriating and I have no uh it just stuff that I

researched do we have another

ground really don't okay

I like this better I think that's cleaner to look at for the schematic for it to dip down like that and then pop back up so you can see that we're hitting this we're hitting this capacitor this is just a little tiny guy tooo a little tiny capacitor and uh these actually like matter you want them as close as possible to the LED like you want it snug right up there so that you get the um the greatest effect from it I messed the song up right here

oh no I didn't I'm an idiot all right

here we

go come on

that would have broke the whole thing

okay there's our circuit baby

come on keep

pushing why are these connected right here you should not be connected

what when did that even

happen let's go let's go let's go let's go

all right all right all right come

on we have a whole mess of situation going on here what happened

good

Lord okay that comes out of 5 volt into the the big cap into the small cap No Cap all right great then data comes out of six should not be going into ground at all how did this happen

we almost lost it there all right let's do quick manual inspection before we have the uh the ERC check okay so ground is going to

this undoing stuff or am I losing my

mind oh this is 5 volts also not ground 5 volts is going to this capacitor and then this needs to hit here why are you not doing

that oh it just did that okay that's strange all right five volts comes in big cap goes into vsss or VCC whatever yes that's great okay the other leg of 5 volt should not be going there

ah okay this is what we

did okay there we go that's

better no please stop you're an absolute Menace okay five Vols the only thing that five Vol should be going to is the cap and then to vsss yes great okay okay ground is going to the ground pins beautiful the ground pins and then uh gp6 which is pin three it's going to the resistor and then to data in and data out all the way through yes okay seven is just going to the switch that's it what pleasure Watching Max good luck with the product need to leave I one for late yes thank you brother you have a great day and happy New Year's all right all right all right all we are looking good here let's let's check this I know it's going to give me an error about power source electrical rules

Checker so we got to make all these happy cuz they're not happy right now

we add a power flag and then we add

a how dare you

we actually add a power flag to this too

oh I'm so silly

why is that one not not happy about that

that one is not

psyched okay uh input power not driven by any output power pins

yes you are

okay

why

e

for is not a fan of my setup

here doesn't like it

this cap giving us problems ah the cap is giving us problems no cap

did I not see that this has

polarity hi Max in community or better said Community yes good morning Miguel how are you today my friend Happy New Year's what's your New Year's resolution what are you doing this coming year what are you building what are you working on I got to

know give me the deets

for

I don't want that cap I don't want that the capacitor I do not want that one

we're going to use something else let me log into my uh AliExpress account and see what I've ordered

it is a 1210 that is what it is

this work why are you doing this to me

it's working everywhere but not this one

where are we now buffering um I am trying to figure out a bug here where uh I cannot get electronic rules Checker to pass on my schematic right now I have my SCH schematic uh drawn up I have the button right here and then I have uh my resistors for my data line I have my capacitor for my LEDs and um I cannot get for some reason when I add this capacitor it does not want to pass uh electronic rules checking

could that be it

[Music]

I'm an electronic engineer and I miss hardware part in my day today I have been working only with software programming yeah that can be nice though cuz some of this Hardware stuff is really rough super rough I cannot figure out why it's so upset about having this capacitor here but um um it does not care about the other capacitors at

all it makes me wonder if I'm like choosing the wrong cap but I don't think I

am for

your desk Hub looks Greener every day yes oh I love to hear that

do you have um do you have any projects you're working on like side projects right now

switch on over to X come on over to the good side oops

I'm going to sign into uh PCB way and see if I can grab my schematic for a different PCB and uh see if I did something differently I have nine minutes to finish

this no it doesn't have it all right my friends this is going to be GG's for now our uh I'll probably finish this just learning full stack and getting better at iOS programming but it will be one of my New Year's resolutions start some project yes I love hearing that that's awesome that's amazing um I feel like the App Store is just like insane like I need to this this coming year I need to get into putting some apps out and uh that would be really cool but um probably going to be uh changing my Tex T then which I hate doing um all right so thank you guys for watching uh we got really close to finishing the uh schematic I don't know this is a weird thing where the I'm having an error on this pin when this cap is here which I've

never seen this before I I don't know why it's causing it I'm sure it's something really stupid but um I'll come back to it later today and I'll figure it out and then I'll post that the uh schematic has been completed thanks guys I'll see you in the next one peace
