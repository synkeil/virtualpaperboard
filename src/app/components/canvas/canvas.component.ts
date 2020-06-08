import { Component, OnInit, ViewChild, ElementRef, NgZone } from "@angular/core";

interface TransObj {
  scale?: number;
  vSkew?: number;
  hSkew?: number;
  hTrans?: number;
  vTrans?: number;
}

interface Points { x: number; y: number; }

@Component({
  selector: "app-canvas",
  templateUrl: "./canvas.component.html",
  styleUrls: ["./canvas.component.css"]
})

export class CanvasComponent implements OnInit {

  @ViewChild("canvasElement", { static: true }) canvasElement: ElementRef<HTMLCanvasElement>;
  @ViewChild("tempCanvasElement", { static: true }) tempCanvasElement: ElementRef<HTMLCanvasElement>;

  // Variables
  public canvas: HTMLCanvasElement;
  public tempCanvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public ctx2: CanvasRenderingContext2D;

  public offscreen: HTMLCanvasElement;
  public offCtx: CanvasRenderingContext2D;
  public offscreenTemp: HTMLCanvasElement;
  public offCtxTemp: CanvasRenderingContext2D;

  public mousebutton: number;

  public painting: boolean;
  public recting: boolean;
  public circling: boolean;
  public eraseing: boolean;
  public moving: boolean;

  public tool: string;
  public mainColor: string;
  public mainWidth: number;

  public baseX: number;
  public baseY: number;
  public points: Points[];
  public lastPos: Points;
  public mainEvent: MouseEvent;

  constructor(private ngZone: NgZone) {
  }

  ngOnInit(): void {
    this.canvas = this.canvasElement.nativeElement;
    this.tempCanvas = this.tempCanvasElement.nativeElement;
    this.offscreen = document.createElement("canvas");
    this.offscreenTemp = document.createElement("canvas");

    this.offscreen.width = window.innerWidth * 3;
    this.offscreen.height = window.innerHeight * 3;
    this.offscreenTemp.width = window.innerWidth * 3;
    this.offscreenTemp.height = window.innerHeight * 3;

    this.ctx = this.canvas.getContext("2d");
    this.ctx2 = this.tempCanvas.getContext("2d");
    this.offCtx = this.offscreen.getContext("2d");
    this.offCtxTemp = this.offscreenTemp.getContext("2d");

    this.mousebutton = null;
    this.painting = false;
    this.recting = false;
    this.circling = false;
    this.moving = false;
    this.eraseing = false;
    this.tool = (document.querySelector("#tool") as HTMLInputElement).value;
    this.mainColor = (document.querySelector("#mainColor") as HTMLInputElement).value;
    this.mainWidth = parseInt((document.querySelector("#mainWidth") as HTMLInputElement).value, 10);
    this.baseX = 0;
    this.baseY = 0;
    this.points = [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}];

    this.resizeCanvas(this.canvas, this.tempCanvas);
    this.ngZone.runOutsideAngular(() => this.animate());
  }
  prevent(ev: Event) {
    ev.preventDefault();
    return false;
  }
  chngColor(e: Event ) {
    this.mainColor = (e.target as HTMLInputElement).value;
  }
  chngWidth(e: Event ) {
    this.mainWidth = parseInt((e.target as HTMLInputElement).value, 10);
  }
  chngTool(e: Event ) {
    this.tool = (e.target as HTMLOptionElement).value;

    if (this.tool === "eraser") {
      this.tempCanvas.classList.add("hide");
    } else {
      this.tempCanvas.classList.remove("hide");
    }
  }

  resizeCanvas = (element: HTMLCanvasElement, temp: HTMLCanvasElement) => {
    element.height = window.innerHeight;
    element.width = window.innerWidth;
    temp.height = window.innerHeight;
    temp.width = window.innerWidth;
  }

  radius(options: {
    ax: number;
    ay: number;
    bx: number;
    by: number;
  }): number {

    const ax = options.ax;
    const ay = options.ay;
    const bx = options.bx;
    const by = options.by;

    const rad = Math.sqrt(((ax - bx) * (ax - bx)) + ((ay - by) * (ay - by))) / 2;

    return rad * 2;
  }

  ctxTransform(transObj: TransObj) {
    const a = transObj.scale || 1;
    const b = transObj.vSkew || 0;
    const c = transObj.hSkew || 0;
    const d = transObj.scale || 1;
    const e = transObj.hTrans || 0;
    const f = transObj.vTrans || 0;

    // this.ctx.transform(a, b, c, d, e, f);

    this.ctx2.drawImage(this.canvas, 0, 0, window.innerWidth, window.innerHeight);

    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    this.ctx.drawImage(this.tempCanvas, 0 + e, 0 + f, window.innerWidth + e, window.innerHeight + f);
    this.ctx2.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  // Functions
  startPos(e: MouseEvent) {
    this.mousebutton = e.buttons;
    this.baseX = e.clientX;
    this.baseY = e.clientY;

    if (e.buttons === 1) {
      if (this.tool === "rectangle") {
        this.recting = true;
      }
      if (this.tool === "circle") {
        this.circling = true;
      }
      if (this.tool === "pencil") {
        this.points.shift();
        this.points.shift();
        this.points.shift();
        this.points.push({x: e.clientX, y: e.clientY});
        this.points.push({x: e.clientX, y: e.clientY});
        this.points.push({x: e.clientX, y: e.clientY});

        this.painting = true;
      }
      if (this.tool === "eraser") {this.eraseing = true; }
      if (this.tool === "move") {
        this.moving = true;
        this.lastPos = {x: e.clientX, y: e.clientY};
      }
    }
  }

  endPos() {

    this.mousebutton = null;
    if (this.tool === "pencil") {this.painting = false; }
    if (this.tool === "rectangle") {
      this.recting = false;
      this.ctx.drawImage(this.tempCanvas, 0, 0, window.innerWidth, window.innerHeight);
      this.ctx2.clearRect(0, 0, window.innerWidth, window.innerHeight);
      this.ctx2.beginPath();
    }
    if (this.tool === "circle") {
      this.circling = false;
      this.ctx.drawImage(this.tempCanvas, 0, 0, window.innerWidth, window.innerHeight);
      this.ctx2.clearRect(0, 0, window.innerWidth, window.innerHeight);
      this.ctx2.beginPath();
    }
    if (this.tool === "eraser") {this.eraseing = false; }
    if (this.tool === "move") {this.moving = false; }

    this.ctx.globalCompositeOperation = "source-over";

    this.offCtx.clearRect(window.innerWidth, window.innerHeight, window.innerWidth, window.innerHeight);
    this.offCtx.drawImage(this.canvas, window.innerWidth, window.innerHeight);

    this.offCtx.beginPath();
    this.ctx.beginPath();

    // cancelAnimationFrame(globalID);
  }

  getPos(e: MouseEvent) {this.mainEvent = e; }

  draw() {
    if (this.mousebutton === 1) {
      console.log("drawing");
      if (this.painting) { this.ctx2.beginPath(); this.pencil(this.mainEvent); }
      if (this.recting) { this.rectangle(this.mainEvent); }
      if (this.circling) { this.circle(this.mainEvent); }
      if (this.eraseing) { this.erase(this.mainEvent); }
      if (this.moving) { this.move(this.mainEvent); }
    }
  }

  move(e: MouseEvent) {
    const currentPos: Points = { x: e.clientX, y: e.clientY };

    if (this.lastPos !== currentPos) { // Check for movement
      const disp: Points = {x: currentPos.x - this.lastPos.x, y: currentPos.y - this.lastPos.y };

      this.offCtxTemp.clearRect(0, 0, window.innerWidth * 3, window.innerHeight * 3);
      // duplicate offscreen canvas
      this.offCtxTemp.drawImage(this.offscreen, 0, 0);
      // Clear offscreen
      this.offCtx.clearRect(0, 0, window.innerWidth * 3, window.innerHeight * 3);
      // Apply transformation to offscreen cnvs
      this.offCtx.transform(1, 0, 0, 1, disp.x, disp.y);
      // Draw image on offscreen with movement applied
      this.offCtx.drawImage(this.offscreenTemp, 0, 0);

      // Reset transform
      this.offCtx.setTransform(1, 0, 0, 1, 0, 0);

      this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      this.ctx.drawImage(
        this.offscreen,
        window.innerWidth,
        window.innerHeight,
        window.innerWidth,
        window.innerHeight,
        0, 0,
        window.innerWidth,
        window.innerHeight,
      );
      // Update last position to current position
      this.lastPos.x = currentPos.x;
      this.lastPos.y = currentPos.y;
    }
  }

  pencil(e: MouseEvent) {
    this.ctx.lineWidth = this.mainWidth;
    this.ctx.strokeStyle = this.mainColor;
    this.ctx.lineCap = "round";

    this.points.shift();
    this.points.push({x: e.clientX, y: e.clientY});

    this.ctx.moveTo(this.points[0].x, this.points[0].y);
    const ctp = {
      x: this.points[1].x * 2 - (this.points[0].x + this.points[2].x) / 2,
      y: this.points[1].y * 2 - (this.points[0].y + this.points[2].y) / 2,
    };
    this.ctx.quadraticCurveTo(ctp.x, ctp.y, this.points[2].x, this.points[2].y);
    this.ctx.stroke();
  }

  rectangle(e: MouseEvent) {
    // Clear the canvas
    this.ctx2.clearRect(0, 0, window.innerWidth, window.innerHeight);

    this.ctx2.lineWidth = this.mainWidth;
    this.ctx2.fillStyle = this.mainColor;
    this.ctx2.lineCap = "round";

    this.ctx2.fillRect(this.baseX, this.baseY, e.clientX - this.baseX, e.clientY - this.baseY);

  }

  circle(e: MouseEvent) {
    // Clear the canvas
    this.ctx2.beginPath();
    this.ctx2.clearRect(0, 0, window.innerWidth, window.innerHeight);
    this.ctx2.closePath();

    this.ctx2.fillStyle = this.mainColor;
    // this.ctx2.lineWidth = mainWidth;
    // this.ctx2.strokeStyle = mainColor;

    const coords = {
      ax: this.baseX,
      ay: this.baseY,
      bx: e.clientX,
      by: e.clientY
    };

    this.ctx2.arc(this.baseX, this.baseY, this.radius(coords), 0, Math.PI * 2, false);
    this.ctx2.closePath();
    this.ctx2.fill();
  }

  erase(e: MouseEvent) {
    this.ctx.globalCompositeOperation = "destination-out";
    this.ctx.lineWidth = this.mainWidth;
    this.ctx.strokeStyle = this.mainColor;
    this.ctx.lineCap = "round";

    this.ctx.lineTo(e.clientX, e.clientY);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(e.clientX, e.clientY);
  }

  animate() {
    // Do stuff
    this.draw();

    const id = requestAnimationFrame(this.animate.bind(this));
  }

}
