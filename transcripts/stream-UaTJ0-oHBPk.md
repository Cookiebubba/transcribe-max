# Building a Glowing Ai GitHub Commit Button

- **Video:** https://www.youtube.com/watch?v=UaTJ0-oHBPk
- **Published:** 2024-12-29T00:31:51Z
- **Duration:** 01:49:06
- **Captions:** auto-generated (en)
- **Words:** 4,977

---

hello hello good morning good morning good morning good morning the saga continues of building the glowing AI commit button good morning good morning how we doing how we doing how we doing let's make sure that we're live on X and on YouTube because we have restream IO set up today so we should be live on both platforms which would be absolutely incredible all righty so our goal for today our goal for today is to figure out the base for our switch so we need to figure out the bottom part of our switch here the base that it's actually going to plug into so I don't have to hold it in my hand when we're clicking it [Music] and then once we have a base set up we're going to have to start with a uh prototype wiring diagram to wire this to

a microcontroller and um from there when we have the microcontroller wired up we will be able to write some code so that the uh the switch can interface with our computer and it can tell our computer to do stuff like send a commit from GitHub and the plan is right now that we can uh we can have a um some code use in llm like Chad gbt to have the commit automatically place a meaningful message based on what kind of code we are committing I hope that makes sense so like AI will go through and look at what we're what code we're committing and uh after we press the button and it'll say hey based on that code you did this commit is you updated the user login so you won't even have to think about it all righty so let's get right to it we have

to take the dimensions of these uh bottom pins and then we have to throw them on we have to throw them on the base that we're creating let's see how we can get that working I'm just going to check and make sure that the levels sound all right on the mic and then I'm not peeking on um on X because that would really suck if this whole time the mic was set up poorly oh they sound great Perfect all right cool so how are we going to to do this it looks like so the bottom pin is probably the most important I'll uh zoom in on this so this is what I'm talking about here with the uh the pins so our base is going to eventually be a PCB but for this prototype we're going to make it just a 3D print and then we'll solder wires to the connectors

just so that we can get a uh a feasible prototype working but um so so since the PCB won't be holding it we'll make like a pretend PCB out of 3D print and we have to have the whole positions line up with these three pins so the middle pin is obviously just plastic and that's the biggest one and that's kind of like the one that will actually uh position the switch and then the other two are the uh Electro connections that are made when the switch actually gets pressed in like that all righty so let's check it out let's see what we can do

I think did we start with the setter pin CU that seems like it's going to be the uh the easiest one to start

with get out of modeling View

okay and I'm going to design the base right next to the

uh the top of the switch here so the base is 70 mm x 70 mm and um I want or the button is 70 mm x 70 mm and I want the top to be and I want the base that it goes into to be maybe like half a millimeter wider than that and um we're going to have to have the same it's not going to work we need to

uh go from diagonal all right there's nothing that makes you feel more like you have no idea what you're doing than live streaming what you're doing all right so I'm going to leave that there and we're we're going to go 7.5 and oops what the hell

why 1.5 mm by

70.5 millimet okay and then um from

there hey sadra happy holidays how you doing what's going on today good morning if it's morning time there if it's not still good morning all right all right so and then the height of the base should probably be like half as short actually it's going to have to be a little bit a little bit more than and then half as short because we have to factor in the height of the switch thank you my man best of luck to you too I'm trying to cook I'm to um so meaning the height of the base has to cover the the height of the switch the bottom of the switch here and then it has to come up like halfway up the side of the button just like the side of like a uh of a keyboard case

wood all right let's see how tall our uh our switches

so our switch is 8 mm okay then

um I think that we also make this 8 mm for now

and this one we're going to print the opposite

way and you know what I'm thinking that it should actually be wider it should be wider than

um than 70.5 millim at least on the outside because because like I had in the photo let me see if I can grab the photo real quick yeah like I had in the photo it should be I want to try to make it look like this photo here so it should be a decent amount wider actually than 70.5 so let's go back here let's go um here and then um we're going to move

this out of the way a little bit and then let's start off with 74

by 74 and then

um oh why didn't that apply 74 what whatever I'm just going to delete

this we'll go 74 by 74 okay that way there we have enough room for this uh border if we want to call it to stick out a bit and then um we need to come up eight with it um I want to have almost the same border radius so we'll do three because that's the Border radius we have on the uh switch three

oops very beautiful and then um we will cut out the room for the actual button itself so let's add we're going to add a construction plane to the top of this right there like that and then um we'll make the body disappear for one

second we'll go top view

and then

add Center oh we're going to have to um go here we'll do one of those click here and then uh we got to add a

square in this one we are going to make 71 and a half or no we're going to make 70.5 I'm just going to leave that for now

70.5 and then we'll go to this I'm going to take this plane

out we're going to go 70 oops

no not that stop

stop 70.5 okay nice we'll take this sketch out

why is that sketch not disappearing whatever we'll delete that we'll delete that

right cool all right so I think that that's way not thick enough compared to this button cuz this little section right here is going to be the outside radius where's the buy button uh I don't have the buy button yet I know that's I literally got message for that yesterday that said hey dude if you're going to if you're going to start working on this and doing stuff then you should probably set up a pre-order button now so that you know like well it's hyped up a tiny bit people can pre-order it but I'm working on the button I'm working on the button instead can somebody um Can somebody build me a landing page please I don't want to do it I don't want to do it just throw something together for me I'm honestly thinking about just

grabbing something off of um or just adding a product to the desk Cup website that way there I don't have to deal with it as terrible as it sounds and then I don't have to make a separate um website but I'm just going to do it I'll make a uh like Ultra simple landing page and uh that way there it's good to

go all right so I am overthinking this prototype I'm going to um I got to just do this damn it I put that on the wrong plane

what we'll do is we'll just move

this yeah we'll move that up like 2

millimet or actually we'll move it up 8 mm so I'm going to move this up 8 mm and then it'll be at the top and then when I bring this down it's going to like chunk out the whole deal and it's going to make the space for our button to go

in there's bottom we'll leave the bottom I'm at 2 mm so it's kind of rigid we'll bring this in three radius bring this in three radius three three okay great so now we kind of have uh our our bottom for the button I still think that the outside perimeter should probably be wider but for a prototype this is going to be a great start

Point all

right now we got to add our switch which is not going to be easy

so we'll start off with the uh the main hole for this prong right here which it looks like I wonder I don't know if that symbol is radius or

diameter 3.8

we're going to find out how wide is the center prong for the Cherry MX key

switch the center prong the stem of a Cherry MX switch is the part of the key cap stem connects to has which part of the stem part that the key cap stem connects to has a width of 1.3 mm I need to sign in CU it's not that's not what we're talking about it's talking about the width of um just wrong it's wrong okay how what is the diameter of the prong on the bottom of a Cherry MX switch that mounts it to the PCB

saying it's 1.5 it's not I know that it's

not I'm just measuring it right now uh with a cal cuz it's definitely not 1.51 2 I need to get a much better caliper all right it's it's like 3.8 this is this 3.8 is definitely the um the diameter all right so we'll go to sketch

Circle and then we're going to go three point or we should go four because you generally want to make things like 2 mm uh bigger than they have have to when they have to interface like when this prong goes in there if it's the same size 3.8 then it won't actually work which be not very

good and now we have to figure out these pins which that is going to be a [ __ ] pain in the ass and I'm not exactly sure how we're going to do that all right so this is looking at the side of the

switch this one right

here and it is saying

oh this hurts my brain it's saying

that it's 2.54 mm in from the end what we really want is how far away it is from the center of our pin hole there which I guess this is giving it to us right here that it's 2

.54 so one is 2.54 and then the other is 5.08 so let's start with that we'll use that so this one oops

this one is 2.54

2.54 okay and then the next one is 5.08

5.08 okay awesome and

so now how far to the side is it oh I think this is what it's telling me right here

Jesus the schematic is insane okay so um I think that it's also 2 54

so I think we could

do oh it can't be

it well I think we're just going to try it

2.54 I knew that trying trying to figure out these pin positioning situation was going to be

difficult so from there we can make a um rectangle not like that

though diagonal rectangle like that and this should be the exact point of one of our pins on the bottom of our key switch

I'm

thinking is that to the middle yeah that is to the middle and the width of it is 81 so we should just make it one millimeter I'm pretty sure I'm overthinking this whole thing no don't do that okay 1 millimeter we got one of them yes Jesus Christ okay see if we can clean this up a little bit

all right now we need to get the second pin we can do this All right so we know it's 5.8 over out that way we have to figure out how far this way it is now

let's look I'm going to look at my caliper first so I get an idea and then I'll get the exact from the schematic after it's looking like it's five six it's like seven is there any measurement on here that's like

seven there's

5.08 and then

because this full distance is 13.95 oh it's 3.8 nice I think I got

it so we'll go here I think this is going to work three [ __ ] what I just say 3.8 okay and then we'll grab this circle we're going to do 1 millimeter again if we can nice

Jesus now I'm thinking that it's not right damn

it we messed up something here so it's 5.08 out all right I got it I got it needs to be 5.0 out

why and then 3 8

over yep 3.8 over

good all right then 1 mm for the God damn it

okay

that sort of looks better I

think but I also don't know

so I think we're going to print a test print of this and see how close we got with these pin holes is what we're going to do and then that'll let us know right away if we got close or not

and then We'll erase all this [Music] stuff and then we'll just send that to the 3D printer for

now switch pin out test

we'll delete

that all right slice it and that's going to take seven minutes

wonder if maybe we should have a raft there N I think it's going be fine we'll try

it all right so we are sing that to the printer right now all right so in recap what we made is the part that actually that this switch the pin holes that the bottom of this switch will plug into and we need to know that size because eventually we'll make a PCB that the pin holes on this will will'll plug into and then we won't need wiring or anything like that so we'll just have um we'll have the switch we'll have a couple of RGB LEDs to make the translucent uh button glow we'll have some capacitors and resistors and we'll have a microprocessor to handle the um the communication to the computer all righty

cool so this will start printing I just warm me up the heating bed right now

and then basically if that ends up being the size that we like we will add it to we'll add it to this which is going to end up being the actual base for the button and then we'll have a base for the button and we'll be able to actually test the button on a um on a Surface which will be nice and then from there we'll have to figure out where the microprocessor is going to go and the microprocessor so it's probably going to have to be thicker than what I have here to be honest this is probably not thick enough and then also it's probably just going to have to be thicker because I don't think that these holes are going to be tall enough to accommodate the height of the pins itself all right so we have we have a lot to think about

here I'm going to um we'll grab I'm going to grab a micro processor

and then we'll start thinking about code and how we're going to get the code for this thing to work which chat GPT is going to help us out a lot with

that let's see let's see let's see

I'm not sure if we're even oh yeah we are all right so let's start talking to chat GPT here

connect the mechanical keyboard switch to an ESP 32 I want it to log into my computer via builtin US BC um the ESP 32

and I would like make it to run a script

when the button is

pressed we're going to start with just running a script and then I'm thinking that we can possibly make a plugin for vs code and I think that cursor uses the same plugins as vs code and then we can uh use the plugin to automate the uh get commit get push for us because if we just have it run a scre grip then it's going to uh have issues with with not knowing which like directory to run the git ad. gomit DM and get push if that makes sense all righty let's see what it says here

so we need to pull up or pull down resistor

one leg of the GPI one leg to the GPI opit whatever we want on the esp32 and then the other leg to ground use a pullup resistor connected between gpio and 3.3 volts if the switch is configured as active low configure the esp32 as a hid device can act as a human interface device this is what I need to know this allows it to emulate a keyboard or similar device over USB use the Arduino framework or ESP IDF with the USB H wow that print already finished that was so fast all right let's grab the print and then uh we'll come right back to this let's see

all right the big reveal do we think that this is going to work oh no it's not going to work at all so so the problem is is the holes that we made for the uh connector the pins you can barely see them cuz they're way too small 1 mm is way too small for that yeah so what we need to do is we need to make those pins like um at least one and 1 and a half millim maybe maybe more let me see if I can just see if that looks like it's going to line up it might I think that it does actually line up which should be a miracle all right let's make these pins bigger and then set another print this is very exciting

delete

that just going to make him

two and then we can go smaller

where did I print this last one was 2 mm

two yes okay oh [ __ ] my bad all right all I did was make the uh the holes bigger on this these two

holes we're going to export it again

and then import it back into

bamboo except for not really

okay that up nice slice it and then print it I hope that's enough material in between those two that it doesn't become one Circle it

is nice no

all right we're printing nice nice nice

all right so back to the uh code here the diameter of the prong or pin on the bottom of a chair no this is not what we need

human interface device. begin initialize hid uh void Loop if digital read switch pin is equal to low keyboard. press key f13 delay 100 keyboard release all this is nice this I don't want to say anything but it seems like this could be straightforward

is we're basically just making a small keyboard like a little tiny keyboard let's see what we can do

this is going to be the microcontroller we're going to use CU it's tiny and it will fit good inside of this see how small that is and then there's that see so this will fit inside of this somewhere we'll hide that and then uh the USB can just kind of like the USBC we'll we'll make a like a hole for it and it'll go out the side of it somewhere we shall see

let's just make sure we we do have pin four okay great and then we need to we got to grab a breadboard

I'm G to grab another switch hold on I'll be right

back all right

so here is our breadboard

I'm not actually sure if you can plug a mechanical keyboard switch into a breadboard or not it'd be nice if you could but I don't think it's going to I don't think the pins are going to be long enough

yeah it doesn't look like the pin are going to be long enough which is super

annoying so I think that instead of using the keyboard switch we're going to have to use a different switch all right I'll get a different switch

all right so we are looking for or a small

button like one of these just for now so we can write the software with

whoopsies

right so that is is a tiny button right there right small button that we're going to use for now just to prototype with so um

we'll throw that in

there we can do one of these so it's in there like that

I don't know if that's going to work

that might

work for

all right so that finished printing from the printer this is supposed to hold our uh mechanical switch so now we can test to see if this actually fits we just made see if this F on this

it's looking like the center pin is a little bit off damn it we're so close

too I wish I had a better way of showing this to you but for whatever reason that center pin does not line up just a tiny bit off so how are we going to go about fixing

that the uh the placement of the pins is perfect but that center pin is not

correct so we need to move that center pin

over I think that if we just move the center pin over we might be doing

good honestly like a millimeter

weird very weird

so then

um all right so we'll

move that's to the right

1 mm for

now delete that luckily these print really

fast okay and then we'll export

STL switch pin out test version three save we'll pull open bamboo Studio again delete this add version three oh my God we don't want to print the uh the switch

again export to STL version three again

replace and

there we are

boom and we'll print

it we might be closer we might be closer all right so while we got that printing we'll go back to the button

situation for

so what I should probably do is add uh solder these pins on there

unfortunately like

this that way for prototyping and all that it'll be much easier because then these pins

can go right in there like

that so I think that's what we're going to have to do real quick what time is it it's 6:40 we have 20 minutes that's going to be just enough time to throw these pins onto um onto it over there let's do

it for

all right so we're going to have no mic for this part because I don't have a mic over at my soldering station is kind of annoying can you do the mic from the no I don't think you can that would be cool if you could do the mic

from from the

iPhone oh I think you can

oh no I might just crashed

everything all right we're not going to do that right

now all right we're just going to have no mic for a minute while we do the soldering of this and then I'll come back then we have a mic after

that for

for

all right so that print finished and we got to [Music] see if it fits this time i' be surprised if we did oh my God so oh fits yeah it's perfect

why wouldn't focus on

that focus on this I just want to focus on it but I'm telling you right now it fits perfectly

could probably make the positioning hole a tiny bit smaller but it's not really

needed okay nice

s like a bug

cool so um from there we can make this a little bit taller maybe 1 mm taller and then we can uh print we can print the actual

um we can make it 1 mm taller and we can print the actual

base where is it uh body there we go

nice how t this this is two need to be at least

three and then we'll go to the bottom of this

go three three okay cool and then

um that should be perfect it's not going to be perfect now that I said that it's definitely not but we'll see

so

go base test V1

I'm thinking this needs to be millimeter taller I'm going to go for

it that way there it actually covers some of the side of the top of the button

and then we'll go to Bamboo bring up the printer prepare get rid of that we'll add base B1 slice this it's going to be 30 minutes we'll send it

cool cool cool cool

cool all while that's printing we'll go back to our software and hardware setup for

so this button does not want to stay in there good at all it's really annoying

all right that seems better I grab some wires I'll be right

back for

so me thinks there's four prongs on this button here I think that I have to use the bottom in the top but we are going to find out and then I'm going to use pin four and ground on this but I need to figure out oh no I covered up the

pin I covered up the labels for the pins on this so

let's see for is 1 2 three four five 6 or one two three four from the back four from the back okay

two three

four all right

and then we got to go to ground with the other side of the

button all right so that is our prototype board there we have the button clicky clicky and then we have our board could be promising so we need to write some software to this and check to see if we are set up right

so let's go into

we're going to pull up vs

code so I don't know why it's not at my

tray for

all right I'm opening up desab Alpha so I can grab the specs for how to set up this board and basically we are in platform IO right now which is is going to be how we communicate

with with our

board and then we have to find the ESP 32 dev

kit right here

all right and then we can pull open main I'm just going to see if we can get this set up quick and then I'm going to turn the stream off because I gotta let my dogs

out oops

we're going to see if key F would

work keyboard press F

okay hid project is what we need to install so we need to install this onto the situation here libraries this is one of those search boxes that it needs to be like

exact all right and then we'll add it to commit button this is going way too smoothly so I don't expect this to to work I think I'm going to unplug my keyboard so I can just plug that into my my

controller I just plugged my microcontroller in and unplugg my keyboard that's it right there

maybe he DH no such file directory looking for HH dependency check out our

registry let's see

sometimes like chat gbd is not great at this

so sometimes it just does not understand e

yeah this should be

installed e

maybe we have to install

H my keyboard's unplugged hold

on e

can I see

for

e e

h

let me get rid of

this and then

all

of

course

for for

I don't know why he doesn't like this for

it's like trying to give me chat gbg is trying to give me like a framework that doesn't actually exist

all right we're going to try this if this doesn't work then I'm getting off and we'll figure it out tomorrow for

hey bab I'm getting off right now
