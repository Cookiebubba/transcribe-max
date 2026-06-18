# Vibe Coding a $100M AAA video game ( day 1 ) #vibejam

- **Video:** https://www.youtube.com/watch?v=ULT3DtNDeAo
- **Published:** 2026-04-09T16:55:20Z
- **Duration:** 02:09:29
- **Captions:** auto-generated (en)
- **Words:** 9,909

---

Hello, hello, hello. Welcome, welcome, welcome. Hello, hello. Today we are vibe coding a hundred million dollar game. For Peter levels. Vibe jam. Let's go. First things first, [music] we got to do um share the link to the stream on X. And let everybody know that we are live. We're doing the thing. The goal today, we're going to write out our goals in a minute here. We're going to write out our goals and I'm going to show you the game that we have so far. Cuz we got a good game so far. And we'll uh we'll take a a look at the competition also. And see what they have going on. And make sure that we are um we're in first place. And we'll uh we'll take a a look at the competition also. I don't know why this stream doesn't look that great of

quality. That's kind of annoying. Like at OBS it looks fantastic, but on uh And we'll uh we'll take a a look at the competition. I'm going to stop. Why does the stream not look that Ooh, whoops. All right. I am tweeting this out. Let everybody know that I'm live. Here's the link. Here I am. And we shall see how that goes. All right. All right, let's dive right into it. So, what we have so far Hold on, I'm going to tell Claude. Can you please get this game started in the local environment, local host 8000? All right. So, that's loading it up locally. I'm going to show you guys what we have so far. All right, so the game is available online right now at don't die.wtf. And you can almost think about it as like Nazi zombies in space.

And so graphically, I think that it's really great. With the um with the textures that we have. This is basically 3.js and it has um a whole bunch of textures loaded on top of I don't know what they call it, like the triangles. And then it Claude code pulled this space background from NASA. So, this is a real This is actual space, believe it or not. And um the game is running at 60 FPS, but I've tried this on like my Windows computer, my gaming computer. And it'll play at 270 FPS. The server that it's running on doesn't really like it. It kind of will like bog down every now and then when there's too many people like chasing me or fighting me. So, the way the game works now is I have these guys chasing after me. And when I kill them, they'll drop ammo.

And they'll drop health as well. And also, I have these rocks in the ground, these purple and these uh gold rocks. So, I can grab these and that gives me um ammo and health also. We have completely directional sound. So, you can hear the enemies' footsteps, where they're coming from, which is like really nice. And then we have um we have sound that I just downloaded from like uh MP3 site for reloading, for shooting gun, for ammo falling on the ground after the gun is being shot. And the gun and the animation was grabbed off of this like Sketchfab site or something like that. Which um I know the game is supposed to be 90% AI generated code, which we're going to be like 99% AI generated code, so I don't think it's a big deal that these

guys I grabbed off of a site called Sketchfab. And I grabbed the gun and like the reload and shooting animation off of uh site called Sketchfab. So, our biggest issue right now, as you can see, is being very repetitive in nature. It's just running away from these guys and turning around and shooting them. I'm trying to find ammo and health to stay alive, as you know. But this fun for about two rounds and then it gets very uh it's just too repetitive. So, I'm thinking like either every other round or something like that, we need to throw in a uh like a change of pace so that the um the game doesn't feel so stale, you know? Like it's fun grabbing stuff and doing that. Um Some other things that we could do to make it a little bit more exciting are

like when you shoot these guys or when you pick up these rocks, it could drop like a power-up of some sort. So, like uh you could move twice as fast or your gun doesn't need to be reloaded or you have infinite ammo or when you grab it uh it is like a one-shot kill, so you can just really quickly go through them. Which I think I think that's probably where we should go to first is actually um a random one-drop kill a random drop that when you pick it up, it's a one-shot kill and we'll have like a nice audio come over that's like one-shot kill upgrade or something like that. Or just like an upgrade audio and then uh we'll have like a one-shot kill text with a countdown timer over the screen uh to show you that like while you have

this it's uh one-shot kill enabled. All right, so let's um let's close this out for now. And then I'm going to open it up in local host.

We do also need to do some uh we have to do some optimizations to make it so that the game loads uh pretty [music] much like instantaneously because right now it does take like a couple of seconds for um when you drop in. And I don't want it really to uh to be like that. So, on local host I have some stuff that is like a little bit further along than the actual game. The The game URL is don't die.wtf. I should um I'll put that in chat real quick. Let me close that so it's not making sounds. But I'll put that um as an overlay here. And that way there if anybody joins the chat, we can uh they can go and play the game. Game don't die.wtf. Game URL. Okay. And then um make it smaller. Yeah, we should probably make this like black or something like that.

Is it possible to change the color? It's got to be. Yeah. Select color. Make it red or something like that. Oh. I don't know why you would want that to be a gradient. This is kind of weird.

All right.

We have that in there.

Cool. All right, let's um let's say randomly, I would like to have the enemies and both of the rocks that you can open up in the game drop a power-up just like the health or ammo power-up so that when you get it, it turns your weapon into a one-shot kill when you shoot uh enemies. No matter what the enemy is.

All right, so we got that going and then [music] I'm going to open a second tab or new window. And we will have another Claude instance [music] running and I'm going to say when you hit escape or go to the main menu, I would like the game to be muted. And that way there, uh when we have the game open here in stream, it's not going to be ultra annoying >> [music] >> in the background there. All right, so real quick while this is uh while this is loading up here I want to take a look at the competition. Cuz I have not done that yet. And we'll see we'll just see what other people are working on. All right. So I feel like everybody using 3.js to do their games, but nobody has figured out the textures thing. You know, like there's no there's no textures over

this, so it just looks extremely AI-generated. And and it seems like that's what most people are doing. All right, this is level he doesn't count. This guy's game is incredible. This is really good. He still does not have textures. He has lighting and there's like effects going on which are really cool. But you can tell he does not have um textures going on either. I don't know how to explain it, but it just like a geometric shape with lighting and color on top of it. And I feel like the textures plus the lighting plus like nice high frame rate is kind of what takes it to the next level. Like here we have this guy. Same thing though. You know, no textures. It looks like he does have a model for his [music] car, which is cool.

That's nice. All right, MRR Hunter. I I knew I my first thought for the game was going to be making something that's like monthly recurring revenue. But I knew right away that everyone was going to be doing that. All right, so this one you just kind of drive around and you try to get as many orbs as possible. Okay.

This is from last year.

Okay, another one. This is vibey. It's definitely vibey, but still no textures. Just like geometric shapes.

Woah, this guy This guy's a very similar looking game to me. I still don't think that it's actual real textures, you know? I don't know what's going on with this. This is crazy. That's too much. Wow, this looks really good. Oh, this is for last year though. This also looks really good.

All right. And there I am. Hello, hello. All right. So let's pull this back open. Let's see where we're at.

All right. A little bit of intro lag. Let's see if it drops the um if it drops one of the power-ups for like the insta kill. I don't see it. You hear that uh you hear that health thing though? Follow me saying. Yeah, you're it's great. All right, no power-up yet. 15% chance. All right, let's go like that and let's go just so that I can test it out. Can you up the chance of it dropping to 100%? >> [snorts] >> And that did not mute. That's annoying. When you press escape or otherwise settings menu audio [music] listener set master mutes all 3.js gun shots when you enemy sounds when you close volume is restored to one. Huh. I was going to say this did not work. Oh, well.

All right, refresh and test it out here.

All right, so uh done. Enemy will drop now. All right, let's pull it back up. Let's see what we got.

All right, there. It did not drop there.

Ah, it's so annoying.

Nothing. Refresh and test it out. Let me know when you want me to set it back to 15%. I am still not seeing anything dropped for a power-up when I kill enemies or open up the rocks.

Huh.

Spawn drop code looks fine. The drop chance at line 50 still filters. I don't know.

Now everything is forced to 100% power-up drops for both enemies and rocks with no random filtering. Refresh and try again. You should see orange glowing skull pickups every time. All right. Let's try it. Make sure you can see the game. Okay, here we go. No.

This is so weird. It's It's one-shotting every single thing. And then um now it's not.

Let's see what the dev tools say.

Still getting no glowing orange skull uh for any of the kills or opening up the rocks at all. Do you want to console log some stuff and see if we can figure out what's going on? All right, so basically that's my number one like debugging strategy when I'm vibe coding there is cuz it can't see the output, so I'll just have it try to fix it and then add console logging. So uh that way there I can run it and then copy the console logs and then paste it back into the uh into the chat and see if it can fix it.

Okay. Refresh. Let's see if we got a lot super loud, huh? We'll turn that down.

I hope you can see Well, I guess you can just try it out here in the world. I don't think it works on Sorry, I think it only works on uh Chrome.

Man, this is so frustrating. Not working here at all.

>> [groaning]

>> I'm going to paste this and I'm going to say killed enemies, smashed rocks. There is nothing in the console log and there is nothing [music] in the game. I don't know how that's possible. Like, did they nuke Opus 4.6 that bad that it can't it can't do the game anymore? They can't build games anymore? I hope not.

All right, let me uh hit a hard refresh.

Oh, I think maybe this time uh Yeah, there we go. Nice. Cool. Oh, that's so satisfying, though. I think that's the worst uh

That's got to be the worst That's got to be the worst icon for that, but uh that's super satisfying.

All right, that makes things a lot more fun. So, when you randomly get one of those, like every whatever. Maybe I'll have it like 30% chance. Then it's way more easy, I guess, to uh

to have the uh levels go further. All right, cool.

I'm going to say, "Okay, that is working great. Bring the drop percentage chance down to 20%." There we go.

So, I feel like on top of having We added We added the power-up, so that's fine. That adds variety. Like, we got to keep adding variety in any way that we can. Basically, we can have the environment change. We can have enemies change. We can have power-ups. Health, ammo. I think we got to try to have enemies change, but not have the but not have the game get too bogged down. So, this is where I got the first enemy. It'd be cool if we got like a a funny enemy.

And maybe um there were some that like shot you and didn't actually like totally run after you.

Is that possible? Let's [music] find out. Who do we got for a guy that looks like uh

that looks badass. Either badass or funny is what we got to go for. Like, this would be [ __ ] hilarious right here. >> [snorts] >> I think we I think we have to go with this. Just try it out. Just see what where this takes us. And then um yeah, we go from there. Hold on 1 second.

I did it. All right. All right. All right.

Oh, [ __ ] My bad. I didn't see you were chatting, Marty. Um I don't know why the uh the chat is not working.

Let me see if I can get it working.

I don't plan on having it multiplayer, but if I could get it multiplayer, I feel like that'd be so sick.

Let me edit the chat so I can get this in there. Paste. Okay.

All right. This is kind of janky, but we're just going to go with it. Who cares? Right?

>> [laughter] >> All right. At least we have some chat on there. Maybe. I don't know.

All right, let's get this guy rolling. Yeah, Marty, I don't know. I don't know if I'm going to do multiplayer or not. Multiplayer is great because it makes it more fun, but then like, it needs to also be able to be uh single player only.

Let's go to animations. And then >> [laughter] >> Man, it'd be mad funny if we had them die when they get shot. >> [laughter] >> Or if their attack was just jumping on you. Oh my god. I just don't know how silly I want to make the game. You know? All right, so we'll have it do um >> [laughter] >> I guess we'll have it do kicks. MMA kick. What else do we have? Let me type in attack.

Brutal assassination.

Oh man, zombie attack.

Oh, the jump attack is so good. Imagine if I just had them all jump attacking at you. All right. Let me sign in. Let me sign in and download this.

And then we will uh we'll try out this.

Oh, I lost my guy.

There he is. Use this character. Animations is attack.

Do do do do do do. So, jump attack is going to be it, I think.

>> [laughter] >> Uh god, this is so stupid.

All right, I should have this going uh when the game first starts, can you have a very fast loading bar go to make sure that like the sky and the textures for the moon landing, the moon ground, and all that are loaded before we can actually like jump into the game.

Okay. So, we downloaded that.

I'm going to go into

third lab and then paste muting jump attack. Oh, [ __ ] Rename this to jump attack. I'm going to name it fat guy jump attack. And then I'm also going to download [music] him without just the T-pose. Basically, I think the way this works is you have to download him, like the character you're going to use, just by himself. And then you have to download like him with the animations, if that makes sense. So, like you have the attack animation, you have the run animation, which we need to figure out which run animation we're going to use right now. Be great if they had a funny run for him.

If he's just If he's just doing this, don't stop. Let me zoom out. >> [laughter] >> If he's just run jumping at you. Oh, yes. Yes, Naruto running. Yes. All right, this is perfect. Oh my god, we're making so much progress here. This is great. All right, download that. Let's get this game going. Let's get this game tuned up.

We'll rename fat guy run. Okay, we'll jump in there. Perfect. I have added fat guy run, fat guy, and fat guy jump attack. Can we have every other level it switch the enemies from the mutant to the fat guy, but make sure we are being ultra smart in performing about the way we are loading these to make sure that everything loads instantly and does not cause a ton of stutters or performance issues. All right, let me check and see if it [music] got the loading animation. Oh, there it is. Takes too long, though. It's fine that it takes too long because I'll have it figure out how to make it take a lot less.

Oh, it's literally so much more fun with the [ __ ] single shot kill thing. Like that makes it so much better. I do think that this environment just needs to be it just needs to have more stuff going on. But I don't exactly know how to like jazz it up quite yet. Cuz I'm not a game designer. But it's got to feel like a hundred million dollars.

Yeah, it's so much better with the one shot kill thing. Cuz then you're going through waves faster and stuff like that. Like we need to start thinking more like short form, like TikTok addiction style gaming. You know, which by switching the enemies and stuff like that, we are definitely headed in that direction. But we just need to even do more, like way more. Like switch the gun, switch the the enemies, somehow switch the terrain and the sky and stuff like that. And that'll all make it much more um >> [sighs] >> So, it says these are large Mixamo FBX files, 41 megabytes each. Now, I refactor enemies.js to preload both enemy types at a knit and spawn the right one per wave. The key for performance, both are loaded in parallel

at startup. Templates are cloned at spawn time. But I don't think we want that because we want it to pretty much load immediately when the when the game starts. I don't know why this uh the stream looks so low res. What is wrong with it? Oh, yeah.

It might be better.

Thank you, Able. Okay. So, hard refresh. Wave one should be mutants, wave two. All right, let's see. Let's see what we got. Come on.

Ready for wave two. Give me a one shot.

All right, wave two. Let's see if the guys come in. The big fat boys. All right, it just lagged like a little bit when that uh when that happened. There he is. Look at him, he's Naruto running at me. Let's see if he attacks me the right way. Oh, he is. But they're not really jumping. Like I I want them to jump forward at me when they're doing that, you know? Oh, it's kind of terrifying. Kind of terrifying. Like they should be jumping forward at me when this is happening. Oh my god, I'm about to die to these guys. I don't know if I like those guys. I mean, maybe if they could jump at me.

When the fat guy start their attack, can you make them close the distance towards me? So, that they get like a little speed boost jumping forward, like actually towards me and and at me, so that the odds of them actually landing their attack are a lot higher.

All right, we'll see if that helps.

I don't know if I love the vibe of that cuz it just kind of uh cuz it could be a serious game, you know? It could be not a funny game. But, I feel like if we did have something funny {slash} fun, the odds of it like standing out or going viral would be a lot higher for the competition that it's in. So, I don't know. I feel like we got to almost choose the the direction we want to head with this. Just just No, I think it is fun. I think we got to leave the [ __ ] guys coming at us like But, we got to figure out a way to make it more difficult cuz right now we're just running away like stupid idiots. It's not It's not actually challenging, you know, which is not good. Like It needs to be far more difficult than what it is here.

I guess we can ask. Well, we just we just made them lunge at us. So, let's see if lunging at us makes it any more uh challenging. We'll clear out wave one real quick here first.

Where are these guys?

All right, wave one cleared. Let's get wave two in here.

Come on. All right, here he is. Here he is. Let's see if he jumps at me. Oh, he does. Oh, oh, oh, gets in your face. Oh, there's nothing you can do about that. There's nothing you can do about that. Okay, okay, >> [laughter] >> okay. All right, that is too difficult. That is too difficult and they're like completely on top of you, which is uh which is too much. Like there should be a little bit more distance between them and you, but they should still be in the attack range. It is too difficult because they can just immediately like swarm you completely and kill you. But, we need to figure out how to like increase the skill gap of the game cuz right now we're just running away from them constantly like idiots, reloading the gun, and [music] uh

and there's really no skill whatsoever to it. So, maybe like maybe I don't know, every now uh like One of the ways I'm thinking of making it more difficult is we could have it randomly have the enemy like some of them are fast and can do the jump on you thing, and then some of them are just regular speed, and then you have to kill the fast ones or something. I don't know, what do you think?

All right, I'm going to make a BRB screen. I'll be right back in 2 seconds.

All right, so I had a great thought when I was gone. What's that? First of all, why does this camera not want to focus on Is this saving function

Why? Why is it doing this to me? Hello, hello, hello. All right, I think we got it. Jesus. Okay. So, I think that we have it change the environment like every five rounds or something like that. So, changing enemies and it changes the environment. Like the next one we do like grassy hills or something like that. With like a blue sky. And then we have like flying things attacking us.

This is taking too long to load. We got to figure out how to make that take take less long to load. And I didn't send that command by accident. Every five every four levels Hold on.

I would like for the surface that we're walking on and the sky and just the environment overall to change completely. So, let's build a new environment before the space environment so that we can see it change right now. And let's make it like grassy hills with a like beautiful blue sky with clouds and the sun. I can find textures and stuff for the grass. And I'll find a new lighting map as well. But, let's get the base built first.

All right, so [sighs] good fat Here's what I suggest for both issues. Fix the fat guy aggression. Want to fix the fat guy aggression. All right, so fix the fat guy aggression, pull back the lunge speed and initiation range so they close distance, but don't pile on top of you. Add a longer cool down between their jump attacks so you have windows to fight back. For skill gap, I think mixing types per wave is the way to go. Every wave has both mutants and fat guys. Mutants are fast, but die in fewer hits. Fat guys are slow, but tanky. As waves progress, the ratios shift, more fat guys later. This force you to prioritize, kill the fast ones rushing you first, then deal with slow tanks.

How does Call of Duty Zombies make their game feel sort of like it has a skill gap when fighting with like the zombies and stuff? Does it have different zombie types, or is it just map elements?

You know what? We're going to watch.

Call of Duty Zombies.

I get some inspiration going.

So, there's different weapons. There's power-ups. Which is cool and fun. The headshot multiplier is definitely awesome. There's also a hit marker.

Classic COD Zombies actually had a pretty shallow enemy variety. It's mostly the same base zombie. The skill cap comes almost entirely from systems mastery and movement. What creates skill gap? Getting zombies into tight groups by running loops around the map. Point management. As you earn more points for body shots plus knife finishes than headshots earlier on. Map knowledge.

Huh. Making the movement slash kiting feel good so players can train enemies, giving the player meaningful resource decisions. Ammo conservation, when to reload, when to grab pickups. Power-up timing, like you want to know when to grab it for max value. Hmm.

I don't know.

We'll start by pulling back the lunge speed and initiation rate. Let's do that. Start with this.

Great. Also, I think we definitely need to add headshots, and we need to add hit markers as well.

And I forgot to tell this one to make it very performant. Which is unfortunate, but oh well, what are you going to do?

Huh.

All right, I got to wait until this um second one finishes.

All right, let's try it out. We got our new area. Yes. Okay, great. We got to get this guy looking way better than that. And we got to add some textures and stuff to this. Oh man, it's so laggy.

That's really laggy for some reason having this new area. Huh, I don't know why.

Maybe it's just because it has both the the space and the other ones.

Yeah, it made it so much more laggy. It's not good.

But it is way better with the um the fat guy updates.

I want to get to level four here and then see if it actually updates the map back to the space map. There we go. Oh man, I got to get rid of this. Whatever it did made it way too laggy.

I wish this would come in time. There you go.

It's so funny when the narrator runs at you like that. Oh, they're definitely still really strong. Darn it, I didn't mean See, that was pretty good because I did actually like die. Okay, now.

So, maybe we can just have the mutant guys in space for four levels. And then have the fat guys here. Or have something ridiculous like a dodo bird running at you. And then that's kind of funny and fun. But fat guys are too strong though.

They're way too strong. Unless you have the one-shot kill thing, which is strong still.

All right. The fat are way too strong still. I mean not way too strong, but they're like a little bit too strong. So, we should dial them back a bit.

Adding this second terrain area has made the game way laggy and just it'll it'll stutter every now and then and [music] has performance issues all of a sudden. So, I don't know if there's some sort of compression or any sort of performance optimization we can do to make it feel massively more optimized, but we need to figure that out. All right. While it's doing that, I'm going to grab some uh grass textures.

The grass textures have been downloaded.

Let's see if the fat guys are still way too strong.

So, somebody who'd be better at debugging would have this set up so that they can just automatically go to what they're trying to test instead of actually playing the game through to that kind of part, but whatever.

W9CA, where'd you get the moon map? I got the moon map. I had 3js build the moon map. And then I put um textures. I had to build the moon map and then I had to build like uh I had it build rocks and stuff like that. And so, uh the the textures came from this site called free PBR. So, it just downloads like moon rock textures and puts it over the top of like the 3js polygons or or whatever they're called. You know, like it just builds a rough shape and then it it fills in the textures. And then it builds rocks and then it fills in the textures over the top of the rocks. And then like for the sky, I had it download an actual sky from NASA and then add in um it was like sunset lighting map which I don't know about any of this stuff, but

yeah, I downloaded the NASA sky, so it's the real space and then [music] it put a lighting map over the top that was like sunset. This is all vibe coded, so I wish I could tell you like, "Oh, I got this from there." but I didn't really get all of this stuff myself. Cuz 90% of this has to be vibe coded.

Oh, no, I lost my camera. Hold on.

We're back. We're still back. Okay.

All right. So, let's get the um

What do we want here?

Let's see. It said it optimized this. We'll see how optimized this is. Oh, it actually it actually does feel way more optimized.

Like it feels way better. Not even close. Like this is running smooth compared to before. And this is only on 60 FPS because the way I have like the HDMI cord going out of the uh the MacBook, unfortunately. These [ __ ] have got to be careful. I'm dead. I'm dead here. I'm definitely dead.

All right. See, I was good. That was good because I was able to survive, but it was really hard. I think that's like where you want to be. So, I need to add uh textures to the um Oh, [ __ ] I might be dead here. I need to add textures for the grass. And I need to add textures for like for the sky. Or not textures for the sky. I need to get like a good sky background like I did with the NASA space background situation. Which will be much better.

Please drop something. No. Keep missing these. No. Damn it. Wait. So, uh let's say I added I added texture for the grass. Can we please throw that in there? And where can we find a beautiful sky to change out that is more realistic sort of like the space sky that we got from NASA.

Okay. And then let's go to I got to find the lighting maps.

Cuz there was these like lighting maps that I found. They were awesome for this.

HDR environment lighting from Poly Haven.

Mhm. Let's check these out. Okay. Where's that one that it just had? It looked so good. These are like these are like lighting maps that I don't really fully understand, to be honest with you. But it kind of just like affects literally the lighting and shadows in the game. But they're like taken from the real world, which makes it super cool. And this is how I made the space feel like way more uh real.

Let's go for it.

I added a lighting map. It's called like tree line driveway or something like that. Can you put that in there, please?

For realistic sky, the current space guy uses a NASA star map EXR from textures environment. For the grasslands biome, you'd want an HDR ICR sky with blue sky clouds and sunlight. Here are the best free resources.

Oh, I didn't get the grass textures.

There is a folder called stylized grass for the grass textures. This is an absolute mess. Like, if a real video game designer saw this, they'd be like, "What the [ __ ] is wrong with you?" No doubt.

All right, let's see how this is looking.

Maybe restart it. I still have not gotten to see the map change because Oh my god, this is [ __ ] ridiculous. Stop it. This is so bad. This is so bad.

I mean, the texture I guess the texture is not horrible, but Uh, how are you supposed to use this texture? This is definitely not the way you're like supposed to use it. And then this grass skylight is awful. God, these guys are impossible.

No. Okay, it's getting difficult. The game is getting more difficult, which is what we wanted. I don't know if we wanted it that much more difficult.

We definitely need a headshot multiplier. You feel robbed if you're shooting at the headshot, but nothing happens.

So, we got to figure out how to fix this lighting map that's horrendous. Cuz it's just not it. It's not it at all.

I just wanted to use the tree line driveway 4K EXR for the lighting, not for the actual visuals, if that makes sense. Isn't that how you utilize those files? Like, I would rather just the um backgrounds be nice blue sky and cloudy um and clouds or whatever.

I was trying to figure out how to Like, I don't think this is how you use the grass texture. Like, I don't know if we have to make Cuz this is just definitely not how you use it. I don't know if we have to make little pieces of grass that stick up or something like that to to actually make it 3D. Cuz this is not good. This is terrible.

Done. EXR is used correctly. Provides realistic outdoor lighting on metallic surfaces. Okay. Ooh. All right, this is better.

All right, what if there's a cloud texture that we can find somewhere? And I wonder what we can possibly do about this grass cuz it is it's not good. It's bad. It's got to go. Let me share with you what the grass looks like. >> [snorts]

>> Uh, file capture.

All right, let me find clouds.

Or just different grass that's not not this.

ground Let's see, wispy grass? Like, this might be better. This is like more just regular grass-looking. We'll download this and then see if they have something for the sky, for like clouds.

No clouds.

Hmm. What about um Oh, jungle leaves, dude. Let's go to organic. fungus

highway lane

rock and stone trees and plants Yes. Oh, this is going to be good. We're going to get some sick trees going. Let's download some bark.

Let's download some uh leaves. Let's see if we can do it.

I'm just dropping these files into um the leaves and the uh and the bark and the grass. I just added leaves, uh pine tree bark, and a different version of grass, grass one. Can you have the grass one instead of the stylized grass that we have currently? And then can you make trees with the pine tree bark and the leaves?

Let's see what we got.

The fat guys need to be even slightly more nerfed. They're still a little bit too difficult right now. Just just the tiniest bit, though.

All right. So, I think we're going to get the um we're going to get the grassland area dialed in. We're going to get the fat guys dialed in, and then we're going to end it there for today. Tomorrow, we'll add the maybe some different gun types and some like movement buffs.

And we'll see if that makes it more fun. We just got to keep adding variety and [ __ ] All right, so it's found everything. The grass one textures have slightly different naming. Let me check the leafy opacity texture, too. That's key for transparent leaves. Awesome. This could either be great or really bad.

But, I feel like we should probably bring down the um Yes. >> [snorts] >> Of course. Of course. We should probably bring down the lighting a little bit cuz it's kind of bright. I don't know, but the space one is dark, so it's kind of nice that this one is bright and then the other one is dark. I'm definitely going to have the lunar surface go first, but I'm just going to dial this one in, and then I'll put it to afterwards.

I don't know why these guys still feel pretty dark even with the lighting and stuff. Like, maybe I should try a different lighting file.

These guys are [ __ ] terrifying.

I might have made them too weak now, though.

All right, if we pass this wave, it should show us if it goes to the moon. Finally. Oh my god.

Come on. Oh, no. Dude, these guys are way too dark. I got to lighten this up. I don't know how to, though. No.

Does this fit? It does. I got to find a I got to find a thing.

Missing.

Oh my god. All right, last guy. All right, it should switch to the moon now. Come on. Oh, wow. That was really seamless. What the I think I'm going to have it switch every single time if it's going to be that seamless.

Dude, that was so good. There's no way it works that fast on uh online, though. I mean, I can't believe how performant 3js is. Oh, well, now it's [ __ ] completely [ __ ] up. All right, we're going to fix that.

But, it's like insanely performant. All right, did this finish? Yeah, it did. Let's uh refresh this and see if we got trees now. Trees, trees, trees. Fix the lag first. It lags so bad. Fix it. What uh what kind of hardware are you on?

These trees are awful.

The grass is way better, though. So, we're going to um we're going to get rid of the trees and keep the grass.

And we have to redo the lighting cuz the lighting is just terrible. All right. Get rid of the trees. They're really bad, and [music] just keep the new grass cuz it's much better. Possible Mango, what um what are you on for uh Let me check the game, the actual

It is lagging right now. But, it only lags in the beginning. I'm going to send the I'm going to send the updates through.

But, I wonder if it lags on I wonder if it plays that good on Safari.

Definitely not as good now. Like, in Chrome, it's so good. On Safari, it's not good. I wish I knew what um what that guy was playing on.

Like, I wish I knew if um Possible Mango. Oh, I'm on a MacBook Air M2 with 5K display, and it lags badly both >> [sighs] >> I think that's I think that I have no cap on the um the resolution plus the frame rate. So, it's probably trying to utilize like it's I tried to do too much. Let me see if I can Let me see if I can dial it back.

Also, I'm going to um Stop. I'll send the uh the updates that I made to the server cuz it feels like it's way feels like it's way better with the with the new updates. And I also want to have it change the map every round. Cuz then you could have like three maps, three different enemy types, and then it would feel like a lot more. I guess not every round, but

cuz you see, for me, even when I load up the uh when I load it up from the server, like, yeah, it lags in the beginning, but then after that, it's totally Gucci. Like, there's no lag at all. It's 60 frames per second fine. But, I think that might be because like, you're on a 5K resolution, and maybe it's too much for the server to I don't know. I got to figure it out. I'll ask Claude. I have someone playing the game on a MacBook Air M2 with a 5K display, and it's lagging really bad for them. It doesn't lag for me at all. I'm playing on a 1440p monitor limited to 60 frames per second on a M5 MacBook Pro. Maybe we should put some limiters in place so that it can only go up to like 80 frames or something like that at maximum and then like

have resolution cap or something like that so it's capped at like 1440p or something. I don't know. Can you just look through all the files in general and make sure that everything is set up to be as high performance and a on running on the server as possible. We'll see. All right, trees are gone. New grass key texture stays. We'll see how this looks.

All right, this looks way better. The sky is awful. I hate the sky. I'm just going to say get rid of the get rid of the sky in general. Can you get rid of the clouds in the sky for now? They look really bad. I don't know why I have to tell it looks really bad. I feel like it's so rude. But um whatever. Sometimes when I send two cloud windows at once like that, it's a little sketchy because like it's definitely going to have a little bit of overlap and hopefully they just don't [ __ ] each other up. But we'll see. Yeah, so like my my main my main thing was like I figured I would make a really good looking game and then uh figure out how I can uh how I can dial it back so that it runs awesome. Like sort of have no limits at all. Make the game as

good as possible and then start taking things away to make it so that it doesn't lag and [ __ ] like that which might be a backwards way of doing it but I don't know.

The main issues for the 5K display pixel ratio two on 5K rendering at 5120 by way too many pixels. No frame cap set animation loop runs a display refresh rate 120 hertz on newer Macs. Camera far plane is 2000 can be reduced. Resize doesn't cap pixel ratio. Let me fix all of this. Let me check if there's also any other performance things. The shadow map dust particles at 1024 is fine. Details are capped at 80. Good. The setup looks solid. The M2 Air should run much smoother now. All right, can you send all of these updates to the server? And all of the new files we added so that the server is the same as the local. We're going to move that just in case. All right, enemy death animation is lagging for me. It lags about 5 seconds

after load and then lags when I kill. Okay. That's good news. That's good feedback. We'll we'll tell it that. I just tested it a bit more. It lags when I kill enemies. Particles must be the issue. Oh, that's that's a good point. The particles when they person is killed. Yeah, you're probably right.

I'm going to say got this feedback. Could the particles on particles when killing an enemy be causing the lag issues? Let's see. Already got it dialed in. And I haven't even uh I haven't even revisited the mobile cuz I think for the game it has to be able to work on mobile as well which is going to be a whole other nightmare.

But we shall see.

What software are you using to stream? I'm using OBS. I'm using OBS, brother.

Let me check the explosion / blood cleanup code in the updated loop. Loop loop loop. Let me see how the sky looks with no clouds real quick.

All right, this is a good canvas. This is a great canvas to start with. Like if we add we change the rocks to something else. Like oh, we can make like a little chest or something like that.

And then we know we need to update the lighting cuz the lighting right now is way too dark or something. I I don't know what is up with the lighting actually.

We need more power ups, too.

Like maybe they could drop a key. Oh, yeah. They could drop a key and then there's like a locked chest somewhere that's sort of like a mystery box that opens and gives you like a serious power up

of sorts.

I think that could be fun and cool.

I'm also not sure if the map needs to be quite this big.

All right. Net result per kill 14 12. Here's what I found. Explosion chunks 12 meshes with 12 new materials per kill six meshes sharing four per allocated materials. [music] Remove point light per explosion. Dynamic lights are expensive. Forces extra render passes. Chunk shrink out instead of opacity fade. Net result 14 allocations plus 12 Here's what I fixed. All right, let's see if this is way better. Can you please send all of these updates to the server?

Brother, if you're still here and you want to press >> [snorts] >> uh shift command R after I send this update to the to the server, then that would be fantastic. I'll let you know when it's done in 1 second here. And [music] then maybe we can see if the particles are better.

Oh, hold on. It's not live yet. It's not live yet. Give it 1 second. Give it 1 second. Thank you, Mango. I appreciate you. You're the goat.

It's syncing everything.

Not live yet. No, where's the gun? That's not good.

It is still syncing. Waiting for the deploy to finish.

>> Man, it's taking forever. All right, I'll be right back.

What's up? What's up? Yeah, it's sort of day one. I I was doing a little bit of um I messed around with some [ __ ] beforehand, but yeah, it's mostly a fresh start. We have um We got some lag issues we're dealing with right now, Ethan. We're trying to figure out. If you want to load the game up, it's at don'tdie.wtf and um I'm updating the server right now, actually, so that I don't think you'll be able to load it. But it will be uh it'll be up soon. Basically, we're making like uh Call of Duty Zombies type thing. With a uh a couple different maps. So, like every four waves, it'll update. And right now, we're trying to build the um We're trying to build a map that's not the moon. This is going to be like a forest map eventually.

Let's see.

I can confirm that it's much smoother now. All right. All right. We're headed in the right direction. Let me see. Let me see. It's not even updated yet, though, fully. I mean it will be, but not yet. And why do I not have a gun?

What in the hell?

I mean, it's still copying files, so maybe that's part of the issue. But I don't know how that's possible. And it also doesn't have any of the textures or anything like that. Oh, [ __ ] I just lost my light.

Doesn't load after command shift R and weapon is not displayed. I think it's because it's still um Cuz it works locally. I think it's cuz it's still updating, maybe? Hmm, no. Let me see.

All right. Weapon is not loading and textures are not loading, either, now on the server. But they are working locally.

It's annoying because I can't just have like a straight-up like I'm used to with regular development, like I can have a just a Git file and I can just obviously push it to Git, pull it to the server, and then deploy it on the server. But with games, since the files are so big, I can't They're too big for Git. So, like I have to do this weird thing where like it has to like copy-paste files and [ __ ] On top of using Git for just like the raw code, which is probably not the best setup for this.

All right, it says the cache location blocks matches.gltf, but the issue is mime types. Let me check again what Engine X thinks.

The best way to do this would probably be to just straight-up vibe code it on the server. And then I don't have to worry about making it match locally and in there, cuz this is what it's supposed to look like.

But we are getting no gun.

It's going through and it's reading. I'm trying to figure out the differences between the local file and the server file. Which I don't understand why I can't just like copy over the large assets and make sure that the code matches based on like the Git, you know? The way it's supposed to be set up is that it's doing like Git ignore on the textures and like the assets that are big. And then everything else is just a regular Git repo. And so, it should pull that and push it. But somewhere along the lines it got [ __ ] up. And this is like the most annoying part of vibe coding is now you have to try to like wrestle it into working correctly.

Oh, I think I might have fixed it. We'll see.

We have to make that initial load faster. It's just too long. All right, so we have grass. We have no gun. Gun is not showing.

It's funny cuz the gun works, but it's not showing.

Hmm. Opus is running so slow on this. 4 minutes on this one task. So annoying.

Please focus on me.

All right, we might um I might call it for here and see if I can get this um updated. I don't know. How long have we been live for? 108 minutes. It's not 2 hours yet.

It's still 403. This could be a permission issue. It was just working though.

Oh, it might have fixed it.

No, it definitely did not fix it. Why is it bad? The moon.

God, this is so weird.

Huh.

It's like it took everything back.

All the changes we made are now gone. I don't have any of the local stuff like the new map or any of that.

Yes, the server game doesn't match the local game at all. It's completely different.

Why? It's currently unable to handle this request.

Site is behind Cloudflare which is caching. No, it's not.

Engine X config is valid, no new errors, the 502.

All right, I'm going to try to redo it in Cloudflare, but I do not think that's the issue at all here.

Basically, a a thinks that Cloudflare is caching uh an old version of the website and it wants me to it wants me to purge it. So, I have a new one. There's eight We got 800 people. How's that even possible?

170.

All right, caching configuration, purge everything. Purge request successfully received. Changes should take effect in less than 5 seconds. Let's see. Nope.

>> [groaning]

>> No, it is completely outdated on the server. Can you make sure that you push everything to get from local? You commit and push everything to get from local and then pull it on the server. Also, make sure that we have all the files needed.

Super annoying.

All right, while that's doing that, we got to figure out what we're going to do with these uh with this cuz this looks like [ __ ] Like we should probably change these rocks to something that fits much better. So, there's not gold and purple rocks in the uh in the grassy part. And then I don't know.

Yeah, I know they're huge right now. I haven't optimized I haven't optimized it yet. They're way too heavy. Assets need optimization, yeah. You're right. You're right.

I don't really know anything about them to be honest cuz it's my first time doing anything game-wise. But, I think they Cloud said that there was some sort of like compression or something like that that it can do.

All right, so it's redoing it's repulling the get repo and sending over the assets again so that it is um it is going to be fixed. Is there anything we can do to compress some of the bigger files like the sky map EXR, the star map 4K EXR, character FBX, the normal OGL, arms base color. All of that stuff is really heavy. It's like 150 plus megabytes. Can we optimize this anyway?

It keeps telling me to purge it, but I've never had to do that before. I don't know. Oh, I think this time might work.

Um

Okay. Seems like that's better.

It's running pretty lag free for me, but it was running lag free before also, so.

I don't know. The site is serving 1.24 gigabytes total with the browser downloading 220 megabytes of XR EXR load. Let me audit and fix this. Oh man, if they can get this dialed down, that would be amazing. It's over now the next wave is not working. What?

Yeah, it's not working.

It's really weird. I didn't I don't think it does that on local either.

I'm going to hide that server IP there. Let's see if it does on local.

Nope, it doesn't.

On the server, uh it never progresses past wave one even when you kill all the enemies. It does not do this on local.

Let's see if we can find some better lighting. For the sheet.

HDR environment map. Oh, what is skies?

Can we just have like a badass sky? That's real. Like this?

Like I feel like we want the sun to be kind of up in the middle. That way there

That way there they're not like completely dark where they're running at you. I don't know. Straight afternoon.

Files match with the wave progression issues like the Cloudflare still serving cache. No, it's not.

We're going to try to update We're going to try to purge Cloudflare again and see if it'll let me progress.

All right, Cloudflare has been purged again.

Let's see.

Nope. Still doesn't move on.

No, I purged everything on Cloudflare, but [music] something is wrong. The server is not progressing >> [music] >> to wave two for some reason even after all the enemies have been eliminated. This is not a problem on local, which is weird.

It says files are identical. This issue must be the fact I model fails to load on the server, so we two enemies never spawned. Yeah, that has to be a

It says it's going to add cache busting query strings. But that's not going to fix it. I don't think so. And then over here, it is doing PNG quant optipng, which is crazy. They're 2K now, but the PNGs are still huge because PNG is lossless. Let me convert the high detail texture normals albedos to optimize PNGs with maximum compression and also convert non-HDR to JPEG. Yikes. Model texture shrink nicely. 13 megabytes to 3 megabytes. Cool. Cool. Cool. Improve engine X gzip config to compress. Nice.

All right, that's a good point. I should be checking this.

This made it much worse.

Hmm.

Now we have nothing coming in.

All right. So, I think we're calling it right there. We got a new map. We kind of [ __ ] it up on the server, but I'm going to fix that this afternoon. But I think overall we're in a cool spot. We have a new map that's sick. And we're optimizing the assets to work better. But um we got to just keep adding variety. So that when someone when the judges pick up the game, every level feels new and fun. And as you're playing the level, things are happening constantly. You know, since it's a game that loads immediately in the browser and [music] there's no like recurring memory or anything like that. It's a it's like kind of like a one-and-done thing. It needs to almost be like a Tik Tok kind of game where it's just like super high dopamine. There's like new

stuff going on, new [ __ ] happening, flashing in your face. But, um we'll be back. Maybe tomorrow or
