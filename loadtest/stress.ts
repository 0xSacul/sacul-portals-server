import { Client, Room } from "colyseus.js";
import { cli, Options } from "@colyseus/loadtest";

function generateRandomMessage() {
  const messages = [
    "Hello there!",
    "How are you doing?",
    "Nice weather today!",
    "I found a treasure!",
    "Let's explore together!",
    "I need some help!",
    "What's your favorite game?",
    "Have you seen any monsters around?",
    "Let's have an adventure!",
    "I love this game!",
    "Do you want to team up?",
  ];

  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

// Function to generate random positions
function generateRandomPosition() {
  const x = Math.floor(Math.random() * 800); // Generates a random number from 0 to 800 (inclusive)
  const y = Math.floor(Math.random() * 500); // Generates a random number from 0 to 500 (inclusive)
  return { x, y };
}

// Function to interpolate (lerp) between two positions
function lerpPosition(startPos: any, targetPos: any, t: any) {
  const x = startPos.x + (targetPos.x - startPos.x) * t;
  const y = startPos.y + (targetPos.y - startPos.y) * t;
  return { x, y };
}

async function main(options: Options) {
  const client = new Client(options.endpoint);
  const room: Room = await client.joinOrCreate(options.roomName, {
    bumpkin: {
      equipped: {
        body: "Beige Farmer Potion",
        hair: "Basic Hair",
        shirt: "Red Farmer Shirt",
        pants: "Brown Suspenders",
        shoes: "Black Farmer Boots",
        tool: "Farmer Pitchfork",
        background: "Farm Background",
        beard: "Santa Beard",
        hat: "Deep Sea Helm",
      },
      experience: 0,
      id: Math.floor(Math.random() * (50000 + 1)),
      sessionId: String(Math.floor(Math.random() * (50000 + 1))),
      tokenUri: `0_0`,
      skills: {},
      achievements: {},
      activity: {},

      previousAchievements: {},
      previousActivity: {},
      previousExperience: 0,
      previousSkills: {},

      updatedAt: 100000500,
    },
    // Random ID
    farmId: Math.floor(Math.random() * (50000 + 1)),
    username: "Player #" + Math.floor(Math.random() * 1000),
    sceneId: "plaza",
  });

  console.log("joined successfully!");

  const playerPosition = {
    current: {
      x: 440,
      y: 440,
    },
    target: generateRandomPosition(),
    lerping: true,
    startTime: Date.now(),
  };

  room.send(0, { x: 440, y: 440 });
  room.onMessage("*", (type, message) => {
    console.log("onMessage:", type, message);
  });

  room.onError((err) => {
    console.log(room.sessionId, "!! ERROR !!", err);
  });

  room.onLeave((code) => {
    console.log(room.sessionId, "left.");
  });

  const chat = () => {
    const randomInterval = Math.floor(Math.random() * 30000) + 1000; // Random interval between 1 and 30 seconds
    setTimeout(() => {
      const message = generateRandomMessage();
      room.send(0, { text: message });
    }, randomInterval);
  };
  // Send random chat messages at random intervals
  setInterval(() => {
    chat();
  }, 10000);
  chat();

  // Move player smoothly to new positions
  setInterval(() => {
    const currentTime = Date.now();

    if (!playerPosition.lerping) {
      // Start lerping to the new target position
      playerPosition.current = playerPosition.target;
      playerPosition.target = generateRandomPosition();
      playerPosition.lerping = true;
      playerPosition.startTime = currentTime;
    }

    // Calculate the lerp progress based on elapsed time
    const elapsed = currentTime - playerPosition.startTime;
    const duration = 20000; // Adjust the duration as needed
    let t = elapsed / duration;
    t = Math.min(t, 1); // Clamp the value between 0 and 1

    // Interpolate (lerp) between the current and target positions
    const newPosition = lerpPosition(
      playerPosition.current,
      playerPosition.target,
      t
    );
    room.send(0, { x: newPosition.x, y: newPosition.y });

    // Check if lerping is complete
    if (t === 1) {
      playerPosition.lerping = false;
      playerPosition.startTime = 0;
    }
  }, 1000 / 8); // 5 times per second
}

cli(main);
