const { Engine, Render, Runner, World, Bodies, Mouse, MouseConstraint, Constraint, Composite, Events } = Matter;

let engine, render, runner;
let bird, slingshot, ground;
let score = 0;
const gameCanvas = document.getElementById('game-canvas');
const startBtn = document.getElementById('start-btn');
const menuOverlay = document.getElementById('menu-overlay');
const scoreDisplay = document.getElementById('score');

function initGame() {
    engine = Engine.create();
    world = engine.world;

    render = Render.create({
        canvas: gameCanvas,
        engine: engine,
        options: {
            width: window.innerWidth,
            height: window.innerHeight,
            wireframes: false,
            background: 'transparent'
        }
    });

    Render.run(render);
    runner = Runner.create();
    Runner.run(runner, engine);

    // Create Ground
    ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight - 10, window.innerWidth, 40, {
        isStatic: true,
        render: { fillStyle: '#2ecc71' }
    });

    // Create Bird
    bird = Bodies.circle(200, window.innerHeight - 200, 20, {
        density: 0.004,
        render: { fillStyle: '#e74c3c' }
    });

    // Slingshot Constraint
    slingshot = Constraint.create({
        pointA: { x: 200, y: window.innerHeight - 200 },
        bodyB: bird,
        stiffness: 0.05,
        length: 1,
        render: { strokeStyle: '#34495e', lineWidth: 5 }
    });

    // Create Targets (Pigs and Blocks)
    const stack = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 5; j++) {
            const block = Bodies.rectangle(
                window.innerWidth - 300 + i * 60,
                window.innerHeight - 60 - j * 60,
                50, 50,
                { render: { fillStyle: '#d35400' } }
            );
            stack.push(block);
        }
    }

    // Pigs
    const pigs = [];
    for (let i = 0; i < 2; i++) {
        const pig = Bodies.circle(
            window.innerWidth - 270 + i * 60,
            window.innerHeight - 400,
            20,
            { render: { fillStyle: '#2ecc71' }, label: 'pig' }
        );
        pigs.push(pig);
    }

    World.add(world, [ground, bird, slingshot, ...stack, ...pigs]);

    // Mouse control
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: { visible: false }
        }
    });

    World.add(world, mouseConstraint);

    // Release mechanics
    let isFiring = false;
    Events.on(mouseConstraint, 'enddrag', function(e) {
        if (e.body === bird) isFiring = true;
    });

    Events.on(engine, 'afterUpdate', function() {
        if (isFiring && bird.position.x > 220) {
            slingshot.bodyB = null;
            isFiring = false;
            
            // Spawn new bird after short delay
            setTimeout(() => {
                if (World.allBodies(world).length < 50) {
                    resetBird();
                }
            }, 3000);
        }
    });

    // Collision score
    Events.on(engine, 'collisionStart', function(event) {
        event.pairs.forEach(pair => {
            if (pair.bodyA.label === 'pig' || pair.bodyB.label === 'pig') {
                score += 100;
                scoreDisplay.innerText = `Score: ${score}`;
            }
        });
    });
}

function resetBird() {
    bird = Bodies.circle(200, window.innerHeight - 200, 20, {
        density: 0.004,
        render: { fillStyle: '#e74c3c' }
    });
    slingshot.bodyB = bird;
    World.add(world, bird);
}

startBtn.addEventListener('click', () => {
    menuOverlay.style.display = 'none';
    initGame();
});

window.addEventListener('resize', () => {
    if (render) {
        render.canvas.width = window.innerWidth;
        render.canvas.height = window.innerHeight;
    }
});
