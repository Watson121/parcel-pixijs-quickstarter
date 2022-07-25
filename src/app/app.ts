import { bomberFrames } from '../assets/loader';
import * as PIXI from 'pixi.js';

interface BomberFrames {
    front: string[];
    back: string[];
    right: string[];
    left:  string[];
}

enum ShapeType {
    RECTANGLE = 0,
    CIRCLE = 1,
    ELLISPE = 2
}

// Prepare frames
const playerFrames: BomberFrames = bomberFrames;

// IMPORTANT: Change this value in order to see the Hot Module Reloading!
const currentFrame: keyof BomberFrames = 'front';

// Graphics Class


const gravity = 2.3;

const height = 1000;
const width = 1000;




export class GameApp {

    private app: PIXI.Application;

    // List of Shapes and their index
    private shapes = new Array<Shape>();
    private index = 0;

    // Number of Shapes to Spwan at start
    private numberToSpawn = 3;

    // Number of shapes in level
    private numberOfShapes : number;

    // Canvas
    private canvas : RectnagleCanvas;

    private numberOfShapeText : PIXI.Text;
    private gravityText : PIXI.Text;

    constructor(parent: HTMLElement) {

        this.app = new PIXI.Application({width, height, backgroundColor : 0x000000});
        parent.replaceChild(this.app.view, parent.lastElementChild); // Hack for parcel HMR
        this.canvas = new RectnagleCanvas(this.app);
        
        this.numberOfShapes = 0;

        this.CreateClickEvents();
        this.CreateShapeArray();
       
    }

    // Creating Click Events for the Canvas
    private CreateClickEvents(){
        this.getApp().stage.interactive = true;
        this.getApp().stage.hitArea = this.getApp().renderer.screen;
        this.getApp().stage.addListener('click', (e) => {

            console.log(e.target);

            if(e.target == this.canvas.graphics) 
            {
                this.ShapeClick(e.data.global.x, e.data.global.y);
            }
        })    
    }

    // Creating a shape array
    private CreateShapeArray(){
          
        this.shapes.splice(0);

        do{
            var newX = Math.random() * (window.innerHeight + 100);
            var newY = window.innerHeight - (window.innerHeight + 250);
            var newshape;

            var type = Math.floor(Math.random() * 3);

            switch(type){
                case 0:
                    newshape = new Rectangle(newX, newY, this.getApp(), this);
                    break;
                case 1:
                    newshape = new Circle(newX, newY, 100, this.getApp(), this);
                    break;
                case 2:
                    newshape = new Ellpse(newX, newY, 50, 100, this.getApp(), this);
                    break;
            }

            this.shapes.push(newshape);
            this.numberToSpawn -= 1;
            this.numberOfShapes += 1;
            this.UpdatingText();
        }
        while(this.numberToSpawn != 0)
    }

    // Updating the Text
    private UpdatingText(){

        this.app.stage.removeChild(this.numberOfShapeText)
        this.app.stage.removeChild(this.gravityText);

        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fontWeight: 'bold',
            fill: ['#ffffff', '#00ff99'], // gradient
            stroke: '#4a1850',
            strokeThickness: 5,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
            wordWrap: true,
            wordWrapWidth: 440,
            lineJoin: 'round',
        });

        this.numberOfShapeText = new PIXI.Text('Number of Shapes ' + this.numberOfShapes.toString(), style);
        this.numberOfShapeText.x = 50;
        this.numberOfShapeText.y = 50;
        this.app.stage.addChild(this.numberOfShapeText)

        this.gravityText = new PIXI.Text('Gravity: ' + gravity.toString(), style);
        this.gravityText.x = 50;
        this.gravityText.y = 100;
        this.app.stage.addChild(this.gravityText);

    }

    public RemoveShape(shape : Shape){
        const index = this.shapes.indexOf(shape, 0);

        if(index > -1){
            this.shapes.splice(index, 1);
            this.app.stage.removeChild(shape.getGraphics());
            this.numberOfShapes -= 1;
            this.UpdatingText();
        }
    }

    public ShapeClick(x : number, y : number){
        var  newshape = new Rectangle(x, y, this.getApp(), this);
        this.shapes.push(newshape); 
        this.numberOfShapes += 1;
        this.UpdatingText();
    }

    public getApp(){
        return this.app;
    }    

    public update(delta){
   

        if(this.shapes.length != 0){

        this.shapes.forEach(element => {
            element.Move(delta);
        });
        }

    
    }
}


// Rectangle Cavnca - DEPERACATED
class RectnagleCanvas {

    private _graphics: PIXI.Graphics;
    public get graphics(): PIXI.Graphics {
        return this._graphics;
    }
    public set graphics(value: PIXI.Graphics) {
        this._graphics = value;
    }

    constructor(app: PIXI.Application){

        this.graphics = new PIXI.Graphics();

        this.graphics.beginFill(0x000000);
        this.graphics.drawRect(0, 0, width, height);
        this.graphics.endFill();
        this.graphics.x = 0;
        this.graphics.y = 0;
        this.graphics.interactive = true;
        app.stage.addChild(this.graphics);
    }
}


// Base Shape Class
export class Shape {
    protected x : number;
    protected y : number;
    protected weight : number;
    protected graphics : PIXI.Graphics;
    protected app : PIXI.Application;
    protected container : PIXI.Container;
    protected gameApp : GameApp;

    // Base Shape Constructor
    constructor(x: number, y : number, app: PIXI.Application, gameApp : GameApp){
        this.x = x;
        this.y = y;
        this.app = app;
        this.weight = Math.random() * 5;
        this.gameApp = gameApp;

        this.graphics = new PIXI.Graphics();
        this.graphics.interactive = true;

        this.app.stage.addListener('click', (e) => {
            if(e.target === this.graphics){
                gameApp.RemoveShape(this);
            }
        })

    }

    // Moving the Shape down the screen
    public Move(delta){
        this.y += delta * 1 * gravity * this.weight;
        this.graphics.y = this.y;     
    }

    // Reseting the position of the shape to the top of the screen
    protected ResetPosition(){
        this.x = Math.random() * width;
        this.y = 0 + Math.random() * 10;

        this.graphics.x = this.x;
        this.graphics.y = this.y;
        this.graphics.renderable = true;
    }

    public getGraphics(){
        return this.graphics;
    }

}

// Circle Shape Class
class Circle extends Shape {

    private radius : number;

    constructor(x: number, y : number, radius: number, app: PIXI.Application, gameApp : GameApp){
        super(x, y, app, gameApp);
        this.radius = radius;


        this.graphics.beginFill(0xDE3249);
        this.graphics.drawCircle(this.x, this.y, this.radius);
        this.graphics.endFill();
        app.stage.addChild(this.graphics);
    }
    
    public Move(delta: any): void {
        super.Move(delta);
        var topOfCircle = this.y - (this.radius * 4);
        var botOfCircle = this.y + (this.radius * 4);

        if(topOfCircle > height){
            this.graphics.renderable = false;
            this.ResetPosition();
        }

        if(botOfCircle < 0){
            this.graphics.renderable = true;
        }

        
    }
}

// Rectange Class
class Rectangle extends Shape {
    constructor(x: number, y : number, app: PIXI.Application, gameApp : GameApp){
        super(x, y, app, gameApp);

        this.graphics.beginFill(0xDE3249);
        this.graphics.drawRect(0, 0, 100, 100);
        this.graphics.endFill();
        this.graphics.x = this.x;
        this.graphics.y = this.y;
        app.stage.addChild(this.graphics);
    }

    public Move(delta: any): void {
        super.Move(delta);

        if(this.y > height){
            this.graphics.renderable = false;
            this.ResetPosition();
        }

        if(this.y < 0){
            this.graphics.renderable = true;
        }
    }
}

// Ellispe Class
class Ellpse extends Shape
{

    private height : number;
    private width : number;

    constructor(x: number, y : number, width : number, height : number, app: PIXI.Application, gameApp : GameApp){
        super(x, y, app, gameApp);

        this.width = width;
        this.height = height;

        this.graphics.beginFill(0xDE3249);
        this.graphics.drawEllipse(this.x, this.y, this.width, this.height);
        this.graphics.endFill();
        app.stage.addChild(this.graphics);
    }

    public Move(delta: any): void {
        super.Move(delta);

        var topOfCircle = this.y - (this.height * 4);
        var botOfCircle = this.y + this.height;


        if(topOfCircle > height){
            this.graphics.renderable = false;
            this.ResetPosition();
        }

        if(botOfCircle < 0){
            this.graphics.renderable = true;
        }
    }
}


    
