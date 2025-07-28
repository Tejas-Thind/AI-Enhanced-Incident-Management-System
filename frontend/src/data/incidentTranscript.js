export const incidentTranscript = {
  meeting_transcript: [
    {
      speaker: "frank",
      text: "Just got paged by the Rootly alert. Error rate on the web tier has spiked — it's off the charts.",
    },
    {
      speaker: "erin",
      text: "Yeah, I'm getting reports from CS too. Users can't even load the homepage.",
    },
    {
      speaker: "erin",
      text: "Confirmed. I tried hitting the app — getting a 502 within a couple seconds.",
    },
    {
      speaker: "erin",
      text: "Is it just the web tier or is the API tier also affected? What about our analytics product?",
    },
    {
      speaker: "carol",
      text: "Looks like API is fine but analytics is down as well - let's record that both Web and Analytics are affected on the incident record please under Affected Services",
    },
    {
      speaker: "carol",
      text: "Ok all of us are busy but ya lets remember to record both of those services on the incident record.",
    },
    {
      speaker: "bob",
      text: "This is a really crazy one, do you guys have any idea whats going on? I'm not sure what to do here.",
    },
    {
      speaker: "carol",
      text: "I have a couple hunches but I'm not sure. I'm going to try to get a few more details from the logs.",
    },
    {
      speaker: "frank",
      text: "How are we only getting paged now? We've been seeing this for 10 minutes. We need a follow up to tune our monitoring and alerting",
    },
    {
      speaker: "carol",
      text: "I managed to load it once, but latency is crazy. Like 10+ seconds on login.",
    },
    {
      speaker: "bob",
      text: "Looks like this is widespread. We should treat this as a SEV-1. Current severity is SEV-2, but we should bump it up. Can someone take care of that?",
    },
    {
      speaker: "carol",
      text: "No time now but lets remember to do this after the fact",
    },
    {
      speaker: "alice",
      text: "Are we seeing anything in Cloudflare?",
    },
    {
      speaker: "carol",
      text: "Pulling up CDN metrics now, but nothing stands out at first glance.",
    },
    {
      speaker: "carol",
      text: "Cloudflare status page is all green. Doesn't look like an edge issue.",
    },
    {
      speaker: "carol",
      text: "Okay, what about traffic volume? Is this just a spike that's overwhelming us?",
    },
    {
      speaker: "carol",
      text: "Checking that too. But traffic looks fairly typical for this hour.",
    },
    {
      speaker: "dan",
      text: "So probably not DDoS or flash crowd then.",
    },
    {
      speaker: "frank",
      text: "It could still be something in the network path — DNS maybe?",
    },
    {
      speaker: "frank",
      text: "I ran a couple tests — DNS resolution is fine from multiple regions.",
    },
    {
      speaker: "bob",
      text: "Alright, so not CDN, not DNS, not traffic. Let's look deeper in the stack.",
    },
    {
      speaker: "carol",
      text: "App servers are showing elevated latency, but not pegged.",
    },
    {
      speaker: "alice",
      text: "Could this be backend-related? Database maybe?",
    },
    {
      speaker: "bob",
      text: "Hang on, just pulled up DB metrics. postgres database is absolutely pegged right now.",
    },
    {
      speaker: "dan",
      text: "Whoa — 100% CPU on postgres.",
    },
    {
      speaker: "dan",
      text: "That's not good. Anyone know what's querying it right now?",
    },
    {
      speaker: "alice",
      text: "Checking logs… seeing a ton of reads on `auth.sessions`.",
    },
    {
      speaker: "carol",
      text: "Yeah, and they're slow. Like 2–3 second execution times each.",
    },
    {
      speaker: "bob",
      text: "Could this be caused by a recent deploy?",
    },
    {
      speaker: "erin",
      text: "Pulling up the deploy timeline now.",
    },
    {
      speaker: "alice",
      text: "Anyone try that new ramen place down the block? Was legit.",
    },
    {
      speaker: "dan",
      text: "What did you have for lunch yesterday? I'm starving now.",
    },
    {
      speaker: "frank",
      text: "Thinking about getting tacos again. Not the healthiest, but worth it.",
    },
    {
      speaker: "frank",
      text: "I swear I blinked and it's already 2 PM. Where does the time go?",
    },
    {
      speaker: "frank",
      text: "Deploy #341 hit prod about 20 minutes ago. Owned by the auth team.",
    },
    {
      speaker: "alice",
      text: "Found the PR. It changes how session validation is done — adds a fallback path.",
    },
    {
      speaker: "erin",
      text: "That fallback path might be triggering more DB lookups than expected.",
    },
    {
      speaker: "frank",
      text: "Oh yeah — looks like it's running a new query on every single page load. ",
    },
    {
      speaker: "bob",
      text: "Well that explains the saturation. It's a pretty heavy join too.",
    },
    {
      speaker: "erin",
      text: "That would hit `auth.sessions` for logged-in and logged-out users, right?",
    },
    {
      speaker: "erin",
      text: "Exactly. We're doing full reads even on static pages.",
    },
    {
      speaker: "erin",
      text: "This is likely our root cause then. Should we initiate a rollback?",
    },
    {
      speaker: "carol",
      text: "I'm in favor. We've ruled out the edge and this is a clear regression.",
    },
    {
      speaker: "alice",
      text: "Alright, let's do it. Who's got access? I'm not sure I have the right permissions.",
    },
    {
      speaker: "dan",
      text: "Okay, found the rollback playbook. It's in Confluence, but it looks... really outdated.",
    },
    {
      speaker: "carol",
      text: "Yeah, this mentions using the old deploy tool. That was deprecated months ago.",
    },
    {
      speaker: "alice",
      text: "I'm trying the command from the doc anyway. Give me a sec...",
    },
    {
      speaker: "alice",
      text: "Nope — permission denied. Looks like I don't have access to trigger this rollback path.",
    },
    {
      speaker: "bob",
      text: "Who actually knows how to do this? Has anyone done a rollback on the new pipeline?",
    },
    {
      speaker: "erin",
      text: "Maybe Frank? He helped with the last hotfix rollout. Let me ping him.",
    },
    {
      speaker: "frank",
      text: "Just joined — yeah, I can kick it off. Give me a minute to pull the commit SHA.",
    },
    {
      speaker: "dan",
      text: "I can't believe we're 8 minutes into a SEV-1 and we still haven't started rollback.",
    },
    {
      speaker: "carol",
      text: "Honestly wild that we don't have a clear rollback flow documented.",
    },
    {
      speaker: "bob",
      text: "This has to go into the postmortem. We should flag the rollback playbook for urgent update.",
    },
    {
      speaker: "erin",
      text: "Totally. Let's make updating the rollback steps an action item after this.",
    },
    {
      speaker: "frank",
      text: "Alright, found the SHA and kicking off rollback now.",
    },
    {
      speaker: "frank",
      text: "I've got it. Rolling back to previous release now.",
    },
    {
      speaker: "dan",
      text: "Rollback in progress... ETA 2–3 minutes to full propagate.",
    },
    {
      speaker: "frank",
      text: "DB CPU is still pinned but trending slightly down. Promising.",
    },
    {
      speaker: "bob",
      text: "Rollback completed. Let's see if things stabilize.",
    },
    {
      speaker: "bob",
      text: "Latency graph is dipping — this looks good.",
    },
    {
      speaker: "bob",
      text: "Error rate is down about 40% already.",
    },
    {
      speaker: "carol",
      text: "Site is loading much faster now. I'm getting sub-1s responses.",
    },
    {
      speaker: "frank",
      text: "Calling it — rollback resolved the issue.",
    },
    {
      speaker: "erin",
      text: "Okay, let's capture some learnings while it's fresh.",
    },
    {
      speaker: "carol",
      text: "First thing: rollback took way too long to initiate.",
    },
    {
      speaker: "erin",
      text: "Yeah. The runbook was outdated. I had to dig through old threads to figure it out.",
    },
    {
      speaker: "bob",
      text: "We should update the rollback runbook — make it front and center in Rootly.",
    },
    {
      speaker: "bob",
      text: "Let's tune our latency and error alerts to be more aggressive.",
    },
    {
      speaker: "alice",
      text: "Another one — this should've been caught in staging.",
    },
    {
      speaker: "erin",
      text: "Do we even have tests for that fallback session path?",
    },
    {
      speaker: "alice",
      text: "Not really. It was an edge case and it slipped through.",
    },
    {
      speaker: "dan",
      text: "We need to add coverage for that. Maybe even some load tests.",
    },
    {
      speaker: "alice",
      text: "Agreed. This caused real customer pain.",
    },
    {
      speaker: "carol",
      text: "Speaking of which — CS reported issues from Customer A and D.",
    },
    {
      speaker: "carol",
      text: "We should log those in the incident record in the Afflicted Customers field",
    },
    {
      speaker: "dan",
      text: "I also saw analytics dashboards failing — this impacted more than just the web app.",
    },
    {
      speaker: "bob",
      text: "Let's flag that in the postmortem. Our initial scope was too narrow.",
    },
    {
      speaker: "carol",
      text: "We originally thought CDN — that was a red herring. Worth calling out.",
    },
    {
      speaker: "frank",
      text: "The DB spike correlated almost exactly with deploy #341. Timeline helps nail it.",
    },
    {
      speaker: "erin",
      text: "Rollback kicked off at 10:12. Full recovery was visible by 10:15.",
    },
    {
      speaker: "frank",
      text: "Can someone grab the graphs and link them in the Rootly incident?",
    },
    {
      speaker: "erin",
      text: "I'll do that. And I'll start a doc for the postmortem notes.",
    },
    {
      speaker: "erin",
      text: "Can someone confirm if we logged this in Rootly?",
    },
    {
      speaker: "dan",
      text: "Let's tag the follow-up tasks as engineering actions.",
    },
    {
      speaker: "erin",
      text: "We should share a Slack update with CS and GTM teams.",
    },
    {
      speaker: "dan",
      text: "Let's include the rollback timestamp in the write-up.",
    },
    {
      speaker: "erin",
      text: "Let's include the rollback timestamp in the write-up.",
    },
    {
      speaker: "dan",
      text: "Let's include the rollback timestamp in the write-up.",
    },
    {
      speaker: "erin",
      text: "Can someone confirm if we logged this in Rootly?",
    },
    {
      speaker: "dan",
      text: "Good work, everyone. This could've gone worse.",
    },
    {
      speaker: "bob",
      text: "Can someone confirm if we logged this in Rootly?",
    },
    {
      speaker: "alice",
      text: "We should share a Slack update with CS and GTM teams.",
    },
    {
      speaker: "frank",
      text: "Can someone post screenshots of the graphs?",
    },
    {
      speaker: "bob",
      text: "We should share a Slack update with CS and GTM teams.",
    },
    {
      speaker: "bob",
      text: "Let's include the rollback timestamp in the write-up.",
    },
    {
      speaker: "carol",
      text: "Good work, everyone. This could've gone worse.",
    },
    {
      speaker: "dan",
      text: "Let's tag the follow-up tasks as engineering actions.",
    },
    {
      speaker: "erin",
      text: "Let's tag the follow-up tasks as engineering actions.",
    },
    {
      speaker: "bob",
      text: "We should probably review alert coverage this week.",
    },
    {
      speaker: "bob",
      text: "Good work, everyone. This could've gone worse.",
    },
    {
      speaker: "carol",
      text: "Is anyone tracking the timeline for the RCA?",
    },
  ],
};
