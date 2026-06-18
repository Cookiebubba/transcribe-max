# Building a Glowing Ai GitHub Commit Button

- **Video:** https://www.youtube.com/watch?v=38Uiw_Fin-w
- **Published:** 2024-12-30T00:16:22Z
- **Duration:** 01:34:07
- **Captions:** auto-generated (en)
- **Words:** 3,363

---

yo yo yo yo we're live day three of building the button we still don't have a name for it yet we need a name for the button we're live we're live we're live fantastic news this morning absolutely fantastic news this morning let's get the suet out here

let's get this tweet out here hold on we got to throw some we got to throw a little sauce at it though first we got to throw a little something on it

oh Mark came through I woke up this morning we got the uh we got the mark reply nothing feels better what is up brother how are you doing the blade King is back how we doing today good morning good morning good morning I don't know where you are but it might be morning for you maybe I don't know I think I'm peeking my mic my check my check my check my check what is up what is

up we need something good we need something good here we need to going me fired up we have a big day today massive day

today oh I got it I got it I got it I got it come on yes here we go

boom boom we're in there all right we're we're going to hit this we're going to hit one of these you got to Hype it up sometimes I don't know if that's going to work

good no no we got to go to my channel and then we got to grab uh we got to grab the YouTube link cuz we're live

baby did you already settle on a name for the product I didn't I didn't I I do sound like I have a cold yeah it's morning I know sorry I'm being I'm being bad streamer I'm not reading the chat right now hey it's just uh it's 5:00 a.m. you know and I'm a dad so it takes me a minute for my uh my voice and all that to come

around you know what's crazy I'm not going to lie I thought that I had everything ready to go but I um I left my button I left I left the actual button upstairs I'm not even going to lie to you which is so annoying The Pusher The Pusher sounds good but it also reminds me a little bit of doing drugs like like uh what's that song just a little push and you'll be flying just a little push okay to-do list what we

need what we need here is uh we have to come up with what do we need we have to build stabilizer Mount like Space Bar

Key all right we need the stabilizer mount and then we need [Music] to so Pressly we need to um write script to push from GitHub all right so this is this is our to-do list right now okay we do the stabilizer Mount first because we are going to design that and then we're going to 3D print it all right so this gets knocked out first well that's printing this is what we got to do we have to start thinking smarter we got to use our head here we have to uh we have to we have to design that and then it's going to start 3D printing and then well that's 3D printing then we start writing the software okay so we have uh we have multiple things going on at once there what's up cuber Dennis how we doing this morning good morning good

morning we're building software today we're we're right we're we're building Hardware we're writing software I need my coffee what's the software used to design/ engineer the button I see you have Kad find out about it yesterday okay so the software using is a uh is an extension of VSS code called platform IO uh oh that that's for the software you want um you want shaper 3D I think that's what you're talking about uh so design/ engineer button yeah so I use Kad to do the PCB work and I say that I I've done two pcbs before so I I have no idea what I'm doing yet but yeah Kad will do our PCB for the for it and basically I've decided I'm just going to make almost like a uh like a keyboard PCB that just has one button on it you know and then I

use shaper 3D which honestly I probably wouldn't recommend unless you're like you could start with this as like a way to get into it as a beginner and then um right after that I would immediately stop using that when you did pcbs at did you fail at first no I didn't which I wish I didn't because I followed an exact video of how to make the PCB but um I uh no I ones shott it completely and then um I I just followed a guys video on how to make it and then I hand soldered all the components on it but uh this PCB that I just made recently um I did not follow any videos on it and I picked all the capacitors resistors LEDs um the the actual ship itself the uh whatever the MCU if you want to call it um and that's the one that I'm like I

have very low hopes for that actually working I have no idea if that that's going to actually work all right so this is what I'm talking about for today all right so that is a plate Mount stabilizer and um that just allows for your pretty much allows for your key to stay stable and stabilizer as you press it down and the problem is with big large button is that when you press big large button down and um it's so wide kind of like a space bar that it'll become unstable and it can jam inside of the uh inside of the housing so if we add a stabilizer it'll keep it stable just like your space bar does that way there if you're not pressing uh in the center of the button if you press in the side it doesn't matter cuz the stabilizer will keep the

button moving uh perfectly vertical and not catching on the

sides I can show you uh I can show you what I'm talking

about so uh if you if you click the button at the top then there's no problems but see right there if you click on the side if we click on the side you see that that's because we have no uh we have no stabilizer support so um basically what we need to do is uh take this piece right here take this piece right here which is basically our plate you want to talk about it like a keyboard take this piece and then uh throw two plate Mount stabilizer mounts on either side but that's going to be a little bit tricky because I've never done anything like that before so I'm thinking that we take apart this plate that I have here we take this apart and then uh from there we'll be able to um measure this and I didn't get a new caliber yet which I need to do that I

should probably just order that now but I also don't want to leak my payment details by accident I think you guys would take it all right thanks for the explanation this is more of a nice to have idea for your product but how difficult do you think it would be to implement a press and hold functionality so user experiences charging up effect when committing it's so funny I was just thinking about that uh yeah absolutely that would be incredible um I was also thinking that like I'm going to put I'm going to put the same uh the same processor the same chip god what the same microprocessor that desk Hub has in the button which is kind of crazy but uh it'll let me um write some crazy software for it it'll let it be Wi-Fi

connected if we want to put a battery in it um so like somebody else brought up we could have a contextual button so the software could realize like what's going on around it and then the button could change depending on the situation and then the LEDs in the button could represent what context the button is in so let me give an example like let's say your computer is off then you could have uh you could have the let me turn the music down a little bit if the um if the computer is off you could have the button realized the computer is off and then the context of the button now becomes let me turn your computer on and off if your computer's on and you're in um CAD like we're in 3D CAD right now then the context of the button becomes um an

export Your Design file button export to sdl and then the color of the button might change to like blue for for shape or 3D if we're in VSS code then the context of the button would change to the GitHub commit button and it would change to green and then you could have you could have it do different stuff depending on if you long press or if you um if you just do like a quick press

so we need to make this right here which this is going to be brutal especially 3D printing it it's going to be brutal

this one feels like it might be out of it might be out of my pay grade I think that we start here we go this is this is using your head we start by adding so right now this is the the actual key Gap we start by adding the uh the extra prongs to it so this has one prong we have to add the uh the two extra prongs that'll interface with the uh with the switch so we should figure out how far away from Center these uh these prongs are and then we'll add them to our design and then we'll start printing that while we designed the um while we designed the actual plate

housing this is the worst caliper ever I'm so sorry guys but uh I need I need a digital

caliper so I think that we're at I think we're at 12 mm right

there yeah I think we're at 12 mm and I'm going to pull up [Music]

um of course I can't type this morning

[Music]

this sounds like a fun idea for implementing a custom dashboard for the button or would it be overc for this there no we're definitely going to need we're definitely going to need a um a dashboard because people are going to want to configure it to do whatever they want you know like especially if they want to configure to do like apple home kit so they can use it to turn on their like lights and TV and stuff we're going to have to put together a custom dashboard but I think that's going to be down the road I think we just launched with an MVP of having the um of having it shipped to GitHub and then from there we like add the dashboard and then we add like hopefully a little bit of like AI in the software

how far apart are the pieces that go over the [Music] stems in a key

cap specifically the shift how far apart the pieces that go over the stems that click into the stabs next to the switch we'll see what it

says this size this water as I spill it all over my keyboard

what does this mean

they're 33.3 mm

apart that's so much further than I measured

I'm just going with my measurements I'm started with 12 [ __ ] it if I'm wrong I'm wrong chat GPT has led me in the wrong direction too many times on this build I can't uh I can't keep letting it derail

me

for

for for

all right we sorry for being quiet we are going to uh God this is right in the way

all righty so we're locked we're going to slice this this is get to print so fast too

all right we're sending that to the printer so

I really need to get organized here I did not expect for this build to have so many layers but I pretty much always underestimate how many how in depth a build is going to be

all righty where is it

no come on this is why I need to label up

oh there's no sketch right

there no

[Music]

we're going to take this and we're going to move it copy it as we move [Music] it here

delete the

outside going delete these

we're going to have nothing left here I should have just started from the beginning with this what just

happened wa what

where did my thing go

I don't know where everything went do you still work a fulltime as well I don't work full-time I work um I run a business uh and I have employees that work with me work for me uh and we do personal traininghealth coaching so I have dialed that way back since since I started uh doing Indie hacking and uh I like to think about it like as my goal right now is that uh if I can make enough money to pay my bills each month with the uh with the Indie hacking that's amazing and then I try to uh make sure that my business doesn't go out of business

but it's extremely

stressful all right so we need to make this right there there

so that's like 1 and 1 12 mm there

then I'm just going to guess that it's 1 mm

6 and a

half and then we're going do the same thing on the side so uh one and half by [Music] one enter by 6 and A2 by 12

okay for

whoopsies for

1.5 don't

6 and a

half by I don't know what that is 1.5

three by one and a half two by six and A2 close this up yes yes yes yes yes yes yes yes yes yes okay so this we're hoping is going to be like that this right here we shall see

need to add the uh little side

prongs and the bottom PR h

completely guessing at this stuff right now

it's way too big

maybe not

okay all our 3D print is done let's go get that together

okay here we are

oh my God it's perfect first time are you kidding me come

on that never

happens I got to grab a button

okay

it's perfect

unbelievable all right so we nailed that

which means we got to print the full the full

deal

for for

we're going to get

organized

okay

for for

for

why it won't let me import the STL that we just exported into um ambo

slicer let us do our work

why all right I'm going to quit and then I'm going to reopen it we'll see if that works

come

on why is this doing this

just doesn't like that one

oh you know what before I forget

don't like that

for

[Music]

uh

why whatever

oh it's

nice I'm measuring another part of this plate mount for

righto God

[Music]

for

[Music] prob [Music]

stupid that's what that should look like for

[Music]

right this look very

sick for

[Music]

all right there's our plate there's our plate good Lord

all right so let to export this

all right so it's got 10 minutes left on the um on the situation for

all right so that's going to be our switch plate

eventually cool

we need to we got to write some software

so right now it is pressing a we got to see if it can press multiple

we have to see if it can send multiple we're going to ask cheat you this

cuz cuz basically I'm going to see if we can do I'm going to see if we can do save as first which would be shift command s

maybe I don't know I'm having a hard time contact switching right [Music]

now for

[Music]

going to open a terminal in the current project directory three and then run

[Music]

let's see what it thinks

okay keyboard press left control shift squiggly release all get add delay get commit get push no delay unless you want to do something after

pushing let's

see

for for

yeah for

see that builds there AOW allowed here before toen oopsies

I'm so silly

w

[Music] for

okay jgpt has no idea what it's doing oops I didn't mean to do that nice that belt

[ __ ]

all right so it recognized the uh the keyboard continue it's not going to recognize this it doesn't know holy [ __ ] it just worked

wait wait wait wait wa wait wa

wait so we'll go here

okay and I'm going to hit the button damn didn't work that time

the first time it worked really good

Control Plus shift plus back

tick so I wonder what it's doing there I never know what it's doing

h see the problem is

let's see

got

all right I'm going to go grab the print cuz it's ready

we got our button

is oh it's so hard to light up

who would have thought a massive button was going to be this to drop line

up come on

let me make sure this does

fit all right it 100% fits

okay e

much

better all right very satisfying I'll just sit here and just press this button for the rest of the Stream all

right so we are sending the wa

bre

still

no no

true

[Music]

eyes

all right

so

[Music] oops hold on [ __ ]

[Music]

right let's see and press it

br

I right take two press

it

okay so what we do left control Shi

practic control [ __ ]

see what happens when we do it here all right I press it

don't know why it's not opening

oh is she not releasing Maybe

how do you connect the button with your Mac incense and cursor window so right now I'm just running uh I'm just having it set up as a keyboard and then having it run um almost like a macro but um I'm going to have to get a lot more advanced than this as far as software goes but I figure for the MVP let's just get a demo of me pressing the button and then having it pull open the terminal and commit so right now to pull open the terminal I'm doing uh left control shift back tick and you have to have VSS code open to your project and then uh I'm doing Enter so when you do control shift back tick it opens this up and asks you to select your current working directory if you're in your terminal um and then hopefully you don't have a

million directories open there and from there we'll press enter and it will open a new working a new terminal in the working directory and then it should uh write these commands what we're going to find out I don't know

all right so we're going to connect oh we already connected never mind we connect the keyboard and then um we'll press and see what happens oh he did it oh my God yes yes all right that's the end of the stream we're calling it right there let's go
