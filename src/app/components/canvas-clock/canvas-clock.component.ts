import { Component, OnInit, ViewChild, ElementRef, NgZone } from "@angular/core";

@Component({
  selector: "app-canvas-clock",
  templateUrl: "./canvas-clock.component.html",
  styleUrls: ["./canvas-clock.component.css"]
})
export class CanvasClockComponent implements OnInit {

  @ViewChild("bgClock", { static: true }) bgClockElement: ElementRef<HTMLCanvasElement>;

  public bgClock: HTMLCanvasElement;
  public bgCtx: CanvasRenderingContext2D;

  private timePropper: number;
  get timeGet(): number {
      return this.timePropper;
  }

  constructor(private ngZone: NgZone) {
    this.timePropper = Date.now();

    this.getTime();
  }

  ngOnInit() {
    this.bgClock = this.bgClockElement.nativeElement;
    this.bgCtx = this.bgClock.getContext("2d");

    this.resizeCanvas(this.bgClock);

    this.ngZone.runOutsideAngular(() => this.animate());
  }

  resizeCanvas = (element: HTMLCanvasElement) => {
    element.height = window.innerHeight;
    element.width = window.innerWidth;
  }

  toDeg(deg: number): number {
    const fact = Math.PI / 180;
    return (deg * fact);
  }

  renderTime(h: number, m: number, s: number) {
    // reset canvas
    this.bgCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    // style arcs
    this.bgCtx.lineWidth = 15;
    this.bgCtx.strokeStyle = "#f55";
    this.bgCtx.lineCap = "round";
    // hours
    this.bgCtx.beginPath();
    this.bgCtx.arc(window.innerWidth / 2, window.innerHeight / 2, 200, this.toDeg(270), this.toDeg((h * 15) + 90), false);
    this.bgCtx.stroke();
    // minutes
    this.bgCtx.beginPath();
    this.bgCtx.arc(window.innerWidth / 2, window.innerHeight / 2, 170, this.toDeg(270), this.toDeg((m * 6) - 90), false);
    this.bgCtx.stroke();
    // secondes
    this.bgCtx.beginPath();
    this.bgCtx.arc(window.innerWidth / 2, window.innerHeight / 2, 140, this.toDeg(270), this.toDeg((s * 6) - 90), false);
    this.bgCtx.stroke();
  }

  getTime() {
    this.timePropper = Date.now();
    const id = requestAnimationFrame(this.getTime.bind(this));
  }

  animate() {
    // Do stuff
    const time = new Date();
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();

    // this.timePropper = Date.now();

    this.renderTime(hours, minutes, seconds);

    const id = requestAnimationFrame(this.animate.bind(this));
  }
}
