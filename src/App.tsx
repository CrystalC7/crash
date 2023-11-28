import { useEffect, useMemo, useRef, useState } from "react";
import { congigurations } from "./configs";
import mountainLayerImg from "./assets/mountains.png";
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

  // @ts-ignore
  let animationId: number | null = null;
  const [bool, setBool] = useState<boolean>(false);
  const spaceObjectsElements = useRef<HTMLImageElement[]>(null);

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
      this.speedY = 5;
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
        context?.clearRect(this.x, this.y, this.width, this.height);
      } else if (this.game.flying && !this.tobeDeleted) {
        this.y += this.speedY;
      }
    }
  }
  // @ts-ignore
  class SpaceObjects {
    game: Game;
    x: number;
    y: number;
    width: number;
    height: number;
    speedY: number;
    image: CanvasImageSource;
    tobeDeleted: boolean;
    constructor(game: Game) {
      this.speedY = Math.random() * 9;
      this.game = game;
      this.x = -10;
      this.width = 50;
      this.height = 50;
      this.y = this.x * Math.random() - this.width;
      this.tobeDeleted = false;
      this.image =
        spaceObjectsElements.current![
          (
            (Math.random() * spaceObjectsElements.current!.length) as any
          ).toFixed(0)
        ];
    }

    draw(context: CanvasRenderingContext2D | null) {
      context?.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    update() {
      this.x += this.speedY;
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

    constructor(game: Game) {
      this.width = 100;
      this.height = 100;
      this.x = game.width / 2;
      this.y = 100;
      this.speedY = 1;
    }

    draw(context: CanvasRenderingContext2D | null) {
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
      this.fallingSpceObjectInterval = 500;
      this.fallingSpceObjectTimer = 0;
    }

    draw(context: CanvasRenderingContext2D | null) {
      this.inititialStars.forEach((star) => {
        star.draw(context);
      });

      this.fallingStars.forEach((star) => {
        star.draw(context);
      });

      this.moon.draw(context);
      this.mountainLayer.draw(context);
    }

    update(deltaTime: number, flying: boolean) {
      this.flying !== flying && (this.flying = flying);

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

      if (this.flying && this.fallingStarsTimer < this.fallingStarsInterval) {
        this.fallingStarsTimer += deltaTime;
      }

      //clear stars
      this.inititialStars = this.inititialStars.filter(
        (star) => !star.toBeDeleted
      );
      this.fallingStars = this.fallingStars.filter((star) => !star.toBeDeleted);
      //
    }

    //the following function create all falling stars
    createFallingStar() {
      const newStar = new FallingStar(this);
      this.fallingStars.push(newStar);
    }

    //create initial stars(those stars are the one you see when you open the game)
    createInitialStars() {
      this.inititialStars = [];

      for (let index = 0; index < 200; index++) {
        const newStar = new Star(this);
        this.inititialStars.push(newStar);
      }
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
      <img hidden src={moon} ref={moonElmenent} alt="moon" />
      <canvas
        ref={(element: HTMLCanvasElement) => (canvas.current = element)}
      ></canvas>
      <button onClick={() => (flying.current = !flying.current)}>
        start flying
      </button>

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

      <button onClick={() => setBool(!bool)}>trigger state update</button>
      <h1>{bool ? "show" : "hidde"}</h1>
    </>
  );
}

export default App;
