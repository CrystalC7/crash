import { useEffect, useMemo, useRef, useState } from "react";
import { congigurations } from "./configs";
import mountainLayerImg from "./assets/mountains_front.png";
import moon from "./assets/—Pngtree—grey moon free illustration_4452211.png";
import { spaceObjects } from "./configs";

function App() {
  const canvas = useRef<HTMLCanvasElement>();
  const canConfig = { ...congigurations };
  let context: CanvasRenderingContext2D | null = null;
  const mountainLayerImgEl = useRef<HTMLImageElement>();
  const mountainLayerImgCompressed = useRef<any>();
  const flying = useRef<boolean>(false);
  const moonElmenent = useRef<HTMLImageElement>(null);
  const rocket = useRef<HTMLImageElement>(null);
  const explsionSpriteImage = useRef<HTMLImageElement>(null);

  // @ts-ignore
  let animationId: number | null = null;
  const [bool, setBool] = useState<boolean>(false);
  const spaceObjectsElements = useRef<HTMLImageElement[]>([]);

  class Star {
    x: number;
    y: number;
    opacity: number;
    speedY: number;
    toBeDeleted: boolean;
    game: Game;
    constructor(game: Game) {
      this.x = game.width * Math.random();
      this.y = game.height * Math.random();
      this.speedY = Math.floor(Math.random() * (5 - 2 + 1)) + 2;
      this.opacity = Math.random();
      this.toBeDeleted = false;
      this.game = game;
    }

    draw(context: CanvasRenderingContext2D | null) {
      context?.save();
      context?.beginPath();
      context && (context.fillStyle = "white");
      context && (context.shadowBlur = 10);
      context && (context.shadowColor = "white");
      context && (context.globalAlpha = this.opacity);
      context?.arc(this.x, this.y, 1, 0, 2 * Math.PI, true);
      context?.fill();
      context?.closePath();
      context?.restore();
    }

    update() {
      if (this.game.flying) {
        this.y += this.speedY;
      }

      if (this.y > this.game.height) {
        context?.clearRect(this.y, this.x, 2, 2);
        this.toBeDeleted = true;
      }
    }
  }

  class FallingStar extends Star {
    constructor(game: Game) {
      super(game);
      this.y = -2;
    }
  }

  class MountainLayer {
    x: number;
    y: number;
    width: number;
    height: number;
    speedY: number;
    game: Game;
    delete: boolean;
    addSpeedY: boolean;
    tobeDeleted: boolean;

    constructor(width: number, height: number, game: Game) {
      this.x = 0;
      this.y = 0;
      this.speedY = 2;
      this.width = width;
      this.height = height;
      this.game = game;
      this.delete = false;
      this.addSpeedY = false;
      this.tobeDeleted = false;
    }

    draw = (context: CanvasRenderingContext2D | null) => {
      if (this.tobeDeleted) return;
      context?.beginPath();
      context &&
        context.drawImage(
          mountainLayerImgEl.current as any,
          0,
          this.y,
          this.width,
          this.height
        );
      context?.closePath();

      if (this.delete) {
        this.addSpeedY = false;
      }
    };

    update() {
      if (this.y > this.game.height) {
        this.tobeDeleted = true;
      } else if (this.game.flying && !this.tobeDeleted) {
        this.y += this.speedY;
      }
    }
  }
  // @ts-ignore
  class SpaceObject {
    game: Game;
    x: number;
    y: number;
    width: number;
    height: number;
    speedY: number;
    image: HTMLImageElement;
    tobeDeleted: boolean;
    minSpeedY: number;
    maxSpeedY: number;
    constructor(game: Game) {
      this.minSpeedY = 2;
      this.maxSpeedY = 5;
      this.speedY =
        Math.random() * (this.maxSpeedY - this.minSpeedY) + this.minSpeedY;
      this.game = game;
      this.width = 100;
      this.height = 100;
      this.x = this.game.width * Math.random();
      this.y = -this.game.height;
      this.tobeDeleted = false;
      this.image =
        spaceObjectsElements.current[
          (
            ((spaceObjectsElements.current.length - 1) * Math.random()) as any
          ).toFixed(0)
        ];
    }

    draw(context: CanvasRenderingContext2D | null) {
      context?.drawImage(
        this.image,
        this.x,
        this.y,
        this.image.width / 4,
        this.image.height / 4
      );
    }

    update() {
      this.y += this.speedY;
      if (this.y > this.game.height) {
        this.tobeDeleted = true;
      }
    }
  }

  class Moon {
    width: number;
    height: number;
    speedY: number;
    y: number;
    x: number;
    game: Game;
    toBeDeleted: boolean;
    constructor(game: Game) {
      this.width = 100;
      this.height = 100;
      this.x = game.width / 2;
      this.y = 100;
      this.speedY = 1;
      this.toBeDeleted = false;
      this.game = game;
    }

    draw(context: CanvasRenderingContext2D | null) {
      if (this.toBeDeleted) {
        return;
      }

      context && context.save();
      context && (context.shadowBlur = 20);
      context && (context.shadowColor = "white");

      context &&
        context.drawImage(
          moonElmenent.current!,
          this.x,
          this.y,
          this.width,
          this.height
        );
      context && context.restore();
    }

    update() {
      if (this.y > this.game.height) {
        this.toBeDeleted = true;
      } else if (this.game.flying) {
        !this.toBeDeleted && (this.y += 1);
      }
    }
  }

  class Meteor {
    game: Game;
    x: number;
    y: number;
    width: number;
    tobeDeeleted: boolean;
    constructor(game: Game) {
      this.game = game;
      this.x = 0;
      this.y = 0;
      this.width = 40;
      this.tobeDeeleted = false;
    }

    draw(context: CanvasRenderingContext2D | null) {
      if (this.tobeDeeleted) {
        context?.clearRect(this.x, this.y, this.width, 1);
        return;
      }

      context && context.save();
      if (context) {
        context.save();
        context.fillStyle = "white";
        context.shadowBlur = 10;
        context.shadowColor = "white";
        context.globalAlpha = 0.3;
        context.translate(this.y, this.x);
        context.rotate(3.5);
        context.fillRect(0, 0, this.width, 1);
        context.restore();
      }
    }

    update() {
      if (this.x + this.width > this.game.width) {
        this.tobeDeeleted = true;
      } else {
        this.x += 2;
        this.y += 6;
      }
    }
  }

  class Rocket {
    y: number;
    x: number;
    game: Game;
    width: number;
    height: number;
    showMultiplier: boolean;

    constructor(game: Game) {
      this.x = game.width / 2 - 150;
      this.y = game.height / 2 + 300;
      this.game = game;
      this.width = 300;
      this.height = 200;
      this.showMultiplier = false;
    }

    draw(context: CanvasRenderingContext2D | null) {
      if (context) {
        context.save();
        context.fillStyle = "red";
        context.drawImage(
          rocket.current!,
          this.x,
          this.y,
          this.width,
          this.height
        );
        context.restore();
      }
    }

    update() {
      if (this.game.flying) {
        if (this.y > 100) {
          this.y -= 1;
        } else if (this.y <= 100) {
          this.showMultiplier = true;
        }
      }
    }
  }

  class PrintMultiplier {
    x: number;
    muliplier: number;
    font: string;
    constructor(game: Game, multiplier: number) {
      this.muliplier = multiplier;
      this.x = game.width / 2 - 50;
      this.font = "Archivo Black, sans-serif";
    }

    draw(
      context: CanvasRenderingContext2D | null,
      y: number,
      showMultiplier: boolean,
      multiplier: number
    ) {
      if (context) {
        context.save();
        context.font = "50px " + this.font;
        context.fillStyle = showMultiplier ? "white" : "transparent";
        context.fillText(multiplier?.toString() + "x", this.x, y);
        context.restore();
      }
    }

    update() {}
  }

  class Explosion {
    width: number;
    height: number;
    game: Game;
    currentTrimIndex: number;
    constructor(game: Game) {
      this.game = game;
      this.height = 200;
      this.width = 200;
      this.currentTrimIndex = 1;
    }

    draw(context: CanvasRenderingContext2D | null) {
      if (context) {
        try {
          context.drawImage(
            explsionSpriteImage.current!,
            4 * 100,
            4 * 100,
            100,
            100,
            this.game.width / 2 - 40,
            this.game.height - this.game.height / 1.5,
            100,
            100
          );
        } catch (error) {
          console.log(error);
        }
      }
    }
    update() {}
  }

  class Game {
    width: number;
    height: number;
    mountainLayer: MountainLayer;
    flying: Boolean;
    inititialStars: Star[];
    fallingStarsInterval: number;
    fallingStarsTimer: number;
    fallingStars: FallingStar[];
    fallingSpceObjectInterval: number;
    fallingSpceObjectTimer: number;
    moon: Moon;
    spaceObjects: SpaceObject[];
    meteors: Meteor[];
    fallingMeteorTimer: number;
    fallingMeteorInterval: number;
    showMeteor: boolean;
    rocket: Rocket;
    multiplierDisplay: PrintMultiplier;
    multipliersList: number[];
    multiplier: number;
    currentTargetMultiplier: number;
    multiplierIncreamentTimer: number;
    multiplierIncrementInterval: number;
    stopShowingMultiplier: boolean;
    explosion: Explosion;

    constructor(width: number, height: number, flying: boolean) {
      this.width = width;
      this.height = height;
      this.mountainLayer = new MountainLayer(this.width, this.height, this);
      this.moon = new Moon(this);
      this.flying = flying;
      this.inititialStars = [];
      this.fallingStars = [];
      this.fallingStarsInterval = 50;
      this.fallingStarsTimer = 0;
      this.fallingSpceObjectInterval = 3000;
      this.fallingSpceObjectTimer = 0;
      this.spaceObjects = [];
      this.meteors = [];
      this.fallingMeteorInterval = 2000;
      this.fallingMeteorTimer = 0;
      this.showMeteor = true;
      this.rocket = new Rocket(this);
      this.multiplierDisplay = new PrintMultiplier(this, 3.5);
      this.multipliersList = [];
      this.multiplier = 2.4;
      this.currentTargetMultiplier = 0;
      this.multiplierIncreamentTimer = 0;
      this.multiplierIncrementInterval = 100;
      this.stopShowingMultiplier = false;
      this.explosion = new Explosion(this);
    }

    draw(context: CanvasRenderingContext2D | null) {
      this.meteors.forEach((meteor) => {
        meteor.draw(context);
      });

      this.spaceObjects.forEach((object) => {
        object.draw(context);
      });

      this.inititialStars.forEach((star) => {
        star.draw(context);
      });

      this.fallingStars.forEach((star) => {
        star.draw(context);
      });

      this.moon.draw(context);
      this.mountainLayer.draw(context);

      this.rocket.draw(context);

      this.multiplierDisplay.draw(
        context,
        this.rocket.y + this.rocket.height + 40,
        this.rocket.showMultiplier,
        this.multiplier
      );

      this.explosion.draw(context);
    }

    update(deltaTime: number, flying: boolean) {
      this.flying !== flying && (this.flying = flying);
      this.flying && (this.showMeteor = false);

      this.rocket.update();

      this.meteors.forEach((meteor) => {
        this.showMeteor && meteor.update();
      });

      this.inititialStars.forEach((star) => {
        star.update();
      });

      this.fallingStars.forEach((star) => {
        star.update();
      });

      this.mountainLayer.update();

      if (this.flying && this.fallingStarsTimer >= this.fallingStarsInterval) {
        this.createFallingStar();
        this.fallingStarsTimer = 0;
      }

      if (this.flying && this.fallingStarsTimer <= this.fallingStarsInterval) {
        this.spaceObjects.forEach((object) => {
          object.update();
        });
      }

      if (
        this.flying &&
        this.fallingSpceObjectTimer >= this.fallingSpceObjectInterval
      ) {
        this.createSpaceObject();
        this.fallingSpceObjectTimer = 0;
      }

      if (
        this.flying &&
        this.fallingSpceObjectTimer < this.fallingSpceObjectInterval
      ) {
        this.fallingSpceObjectTimer += deltaTime;
      }

      if (this.flying && this.fallingStarsTimer < this.fallingStarsInterval) {
        this.fallingStarsTimer += deltaTime;
      }

      if (
        !this.flying &&
        this.fallingMeteorTimer < this.fallingMeteorInterval
      ) {
        this.fallingMeteorTimer += deltaTime;
      }

      if (
        !this.flying &&
        this.fallingMeteorTimer >= this.fallingMeteorInterval
      ) {
        this.createMeteor();
        this.fallingMeteorInterval = (Math.random() * (20 - 3) + 3) * 1000;
        this.fallingMeteorTimer = 0;
      }

      if (flying) {
        this.moon.update();
        if (this.multipliersList.length < 1) {
          this.createMultipliersList();
        } else if (
          this.rocket.showMultiplier &&
          this.multiplierIncreamentTimer >= this.multiplierIncrementInterval &&
          this.stopShowingMultiplier === false
        ) {
          this.multiplier = this.multipliersList[this.currentTargetMultiplier];
          this.currentTargetMultiplier += 1;
          this.multiplierIncreamentTimer = 0;

          if (this.currentTargetMultiplier + 1 >= this.multipliersList.length) {
            this.stopShowingMultiplier = true;
            return;
          }
        } else if (
          this.rocket.showMultiplier &&
          this.multiplierIncreamentTimer < this.multiplierIncrementInterval &&
          this.stopShowingMultiplier === false
        ) {
          this.multiplierIncreamentTimer += deltaTime;
        }
      }

      //clear stars
      this.inititialStars = this.inititialStars.filter(
        (star) => !star.toBeDeleted
      );
      this.fallingStars = this.fallingStars.filter((star) => !star.toBeDeleted);
      //

      ///clear space objects
      this.spaceObjects = this.spaceObjects.filter(
        (object) => !object.tobeDeleted
      );

      //cleate meteors
      this.meteors = this.meteors.filter((meteor) => !meteor.tobeDeeleted);
    }

    //the following function create all falling stars
    createFallingStar() {
      const newStar = new FallingStar(this);
      this.fallingStars.push(newStar);
    }

    //create space objects
    createSpaceObject() {
      const newSpaceObjects = new SpaceObject(this);
      this.spaceObjects.push(newSpaceObjects);
      console.log(this.spaceObjects);
    }

    //create initial stars(those stars are the one you see when you open the game)
    createInitialStars() {
      this.inititialStars = [];

      for (let index = 0; index < 200; index++) {
        const newStar = new Star(this);
        this.inititialStars.push(newStar);
      }
    }

    //create white meteor
    createMeteor() {
      const newMeteor = new Meteor(this);
      this.meteors.push(newMeteor);
    }

    //function
    createMultipliersList() {
      const multipliers = [];
      for (let i = 1; i < this.multiplier; i += 0.01) {
        multipliers.push(+(i + 0.1).toFixed(2));
      }
      this.multipliersList = [...multipliers];
    }
  }

  const initializeGame = useMemo(() => {
    const game = new Game(
      canConfig.canvasWidth,
      canConfig.canvasHeight,
      flying.current
    );
    game.createInitialStars();
    return game;
  }, [flying]);

  const animate = (timeStamp: number) => {
    const deltaTime = timeStamp - canConfig.gameTime;
    canConfig.gameTime = timeStamp;

    context?.clearRect(0, 0, canConfig.canvasWidth, canConfig.canvasHeight);
    initializeGame.draw(context);
    initializeGame.update(deltaTime, flying.current);
    congigurations.gameTime = timeStamp;

    animationId = requestAnimationFrame(animate);
  };

  useEffect(() => {
    canvas.current && (canvas.current.width = canConfig.canvasWidth);
    canvas.current && (canvas.current.height = canConfig.canvasHeight);
    canvas.current && (context = canvas.current.getContext("2d"));

    const image = mountainLayerImgEl.current;
    const canvasImg = document.createElement("canvas");
    const lexicalContext = canvasImg.getContext("2d");

    canvasImg.width = 3000;
    canvasImg.height = (image!.height / image!.width) * 200;

    lexicalContext?.drawImage(image!, 0, 0);

    const compressedDataURL = canvasImg.toDataURL("image/png");
    const compressedImage = new Image();
    compressedImage.src = compressedDataURL;
    mountainLayerImgCompressed.current = compressedImage;
    animationId = requestAnimationFrame(animate);
  }, []);

  return (
    <>
      <img
        src={mountainLayerImg}
        ref={(element: HTMLImageElement) =>
          (mountainLayerImgEl.current = element)
        }
        hidden
        alt=""
      />
      <img ref={rocket} src={canConfig.rocket} alt="rocket" hidden />
      <img hidden src={moon} ref={moonElmenent} alt="moon" />
      <img
        hidden
        src={canConfig.rocketExplosionImg}
        alt="explsion sprite"
        ref={explsionSpriteImage}
      />
      <canvas
        ref={(element: HTMLCanvasElement) => (canvas.current = element)}
      ></canvas>

      {spaceObjects.map((src, index) => {
        return (
          <img
            hidden
            key={index}
            ref={(el: HTMLImageElement) => {
              spaceObjectsElements.current &&
                (spaceObjectsElements.current[index] = el);
            }}
            src={src}
            alt=""
          />
        );
      })}

      <div className="">
        <button onClick={() => (flying.current = !flying.current)}>
          start flying
        </button>
      </div>

      <button onClick={() => setBool(!bool)}>trigger state update</button>
      <h1>{bool ? "show" : "hidde"}</h1>
    </>
  );
}

export default App;
