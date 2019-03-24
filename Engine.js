        // JavaScript code goes here

        //constants
        let RecursiveConstructerLength = 700;
        let startAngle = 7 * Math.PI / 4;
        let startLength = Math.sqrt(2) * 350

        //initializing things
        var mouseX = 400;
        var mouseY = 350;

        var flipA = 2;
        var flipB = 2;

        var fracAngle = startAngle;
        var fracLength = startLength;

        var canvas = document.getElementById("myCanvas");
        var ctx = canvas.getContext("2d");
        var pointArray;
        var currentPoint = 0;
        var iterations = 7;
        var currentType;
        var fractal;

        var screen = 1;

        var BaseList;
        var recList;
        var recEnd;

        class Point {//Holds X Y, value and line type values simultaniously as an object. Used for turning calculated points
            constructor(X, Y, type) {
                this.X = X;
                this.Y = Y;
                this.type = type;
            }
        }

        class FractalLine {
            constructor(angle, length, type) {
                this.type = type;//type 0 is invisible, type 1 is normal. type 2 is left-hand recursive. type 3 is flipped recursive
                this.angle = angle;
                this.length = length;
            }
            makeInto(tilt, scalar, isFlipped) {
                if (isFlipped)
                    return new FractalLine(tilt - this.angle, this.length * scalar, this.type);
                else
                    return new FractalLine((tilt + this.angle),this.length * scalar, this.type);
            }
            findEnd(X, Y) {
                return new Point(Math.cos(this.angle)*this.length + X, Math.sin(this.angle)*this.length + Y);
            }

        }

        /**/class FPointList {
            constructor(X, Y, FLine){
                this.myPos = FLine.findEnd(X, Y);
                this.type = FLine.type;
                this.angle = FLine.angle;
                this.length = FLine.length;
                this.X = this.myPos.X;
                this.Y = this.myPos.Y;
                this.nextPoint = null;
            }
           /**/
            getPoint(n) {
                if (n <= 0) {
                    return this;
                }
                else if (this.nextPoint != null) {
                    return this.nextPoint.getPoint(n - 1);
                }
                else {
                    return null;
                }
            }

            replaceLine(startFPoint, a, final) {//a = array of point objects, final = type of 'last' line
                    var prevFPoint = startFPoint
                    for (var i = 0; i < a.length; i++) {
                        prevFPoint.nextPoint = new FPointList(prevFPoint.X, prevFPoint.Y, a[i].makeInto(this.angle, this.length / RecursiveConstructerLength, this.type == 3));
                        prevFPoint = prevFPoint.nextPoint;
                    }
                    prevFPoint.nextPoint = this;
                    this.length = distance(this.X, this.Y, prevFPoint.X, prevFPoint.Y)
                    var delX = prevFPoint.X - this.X;
                    var delY = prevFPoint.Y - this.Y
                    this.angle = Math.atan(delY/delX);
                    if(delX < 0 == Math.cos(this.angle) < 0){
                        this.angle += Math.PI;
                    }
                    this.type = final;
            }

            add(point) {
                if (this.nextPoint == null) {
                    this.nextPoint = new FPointList(this.X, this.Y, point);
                } else {
                    this.nextPoint.add(point);
                }
            }
        }

        function makeFractal(X, Y, baseL, recL, recLast, finL, finLast, n) {//base list, recursive list, finishing list, iterations
            var output = new FPointList(X, Y, new FractalLine(0, 0, 0))
            var i = 0;
            for (i = 0; i < baseL.length ; i++) {
                output.add(baseL[i]);
            }
            var current;
            var next;
            for (i = 0; i < n - 1; i++) {
                current = output;
                while(current.nextPoint != null){
                    next = current.nextPoint;
                    if (next.type > 1) {
                       next.replaceLine(current, recL, recLast);
                    }
                    current = next;
                }
            }
            current = output;
            while(current.nextPoint != null) {
                next = current.nextPoint;
                if (next.type > 1) {
                    next.replaceLine(current, finL, finLast);
                }
                current.angle %= (2 * Math.PI);
                current = next;
            }
            return output;
        }
        function distance(XA, YA, XB, YB) {
            return Math.sqrt((XA - XB) * (XA - XB) + (YA - YB) * (YA - YB))
        }
        function drawLine(){
            ctx.moveTo(XA,YA);
            ctx.lineTo(XB,YB);
            ctx.stroke();
        }

        function draw() {
            
            // drawing code
            var base = [new FractalLine(0, 300, 2)]//, new FractalLine(2 * Math.PI / 3, 200, 2), new FractalLine(4 * Math.PI / 3, 200, 2)];
            var recurse = [new FractalLine( fracAngle, fracLength, flipA)];
            list = makeFractal(250, 400, base, recurse, flipB, [], 1, iterations)

            //var foo = new FPointList(100, 100, new FractalLine(0, 200, 2));
            //var fee = new FPointList(100, 100, new FractalLine(0, 0, 0))
            //foo.replaceLine(fee,recurse,3);
            ctx.moveTo(250,400);
            var drawing = list;
            while (drawing != null) {
                ctx.lineTo(drawing.X, drawing.Y);
                //window.alert(drawing.angle*180/Math.PI + " " + drawing.length);
                drawing = drawing.nextPoint;
            }

            ctx.moveTo(50, 700);
            ctx.lineTo(mouseX, mouseY);
            ctx.lineTo(750, 700)
            ctx.stroke();
            
        }
        function flipOne() {
            if (flipA == 2) {
                flipA = 3;
            }
            else {
                flipA = 2;
            }
            draw();
        }

        function flipTwo() {
            if (flipB == 2) {
                flipB = 3;
            }
            else {
                flipB = 2;
            }
            draw();
        }

        function mouseUp(event) {
            var x = event.clientX;
            var y = event.clientY;

            this.length = distance(50, 700, x, y);
            var delX = 50 - x;
            var delY = 700 - y;
            fracAngle = Math.atan(delY / delX);
            if (delX < 0 == Math.cos(fracAngle) < 0) {
                fracAngle += Math.PI;
            }

            mouseX = x;
            mouseY = y;

            draw();
        }
        function setType(to) {
            currentType = to;
        }
        function makeFLine(AX, AY, BX, BY, type) {
            var length = distance(BX, BY, AX, AY)
            var delX = prevFPoint.X - BX;
            var delY = prevFPoint.Y - BY
            var angle = Math.atan(delY / delX);
            if (delX < 0 == Math.cos(angle) < 0) {
                angle += Math.PI;
            }
            return new FractalLine(angle, length, type);
        }
        function nextScreen(){
            newScreen((screen)%3+1);
        }
        function newScreen(newScreen) {
            screen = newScreen;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (newScreen == 1) {
                pointArray = null;
                BaseList = null;
                recList = null;
                recEnd = null;          
                currentPoint = 0;
            }
            else if (newScreen == 2) {
                BaseList = pointArray;
                pointArray = [makeFLine(0, 0, 400, 50, 0)];
                currentPoint = 0;
            }
            else {
                recList = pointArray;
                recEnd = currentType;
                fractal = makeFractal(0, 0, BaseList, recList, recEnd, [], 1);
            }
            drawScreen()
        }
        function drawScreen() {
            if (screen == 3){
                ctx.moveTo(100, 300);
                var drawing = fractal;
                while (drawing != null) {
                    if (drawing.type != 0)
                    {
                        ctx.lineTo(drawing.X, drawing.Y);
                        
                    }
                    drawing = drawing.nextPoint;
                }

                ctx.stroke();
            }
        }
        draw()
        function clear() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        function changeIterations(amount) {
            if (iterations + amount > 0); {
                iterations += amount;
                draw();
            }      
        }
        function reset() {
            iterations = 7;
            flipA = 2;
            flipB = 2;
            fracAngle = startAngle;
            fracLength = startLength;
            draw();
        }