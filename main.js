window.onload = () => {
    console.log("Début du code");

    let scale = 25; // Zoom

    let canvas = window.document.getElementById("canvas");
    let context = canvas.getContext("2d");

    let mustBulletDestroyed = false;

    context.fillStyle = '#FFFFFF';
    context.font = '40px Arial';

    let playerOneScore = 0;
    let playerTwoScore = 0;

    // "Import" des classes box2dweb
    let b2World = Box2D.Dynamics.b2World;
    let b2Vec2 = Box2D.Common.Math.b2Vec2;
    let b2AABB = Box2D.Collision.b2AABB;
    let b2BodyDef = Box2D.Dynamics.b2BodyDef;
    let b2Body = Box2D.Dynamics.b2Body;
    let b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
    let b2Fixture = Box2D.Dynamics.b2Fixture;
    let b2MassData = Box2D.Collision.Shapes.b2MassData;
    let b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
    let b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
    let b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
    let b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;
    let b2LineJoint = Box2D.Dynamics.Joints.b2LineJointDef;

    let gravity = new b2Vec2(0, 0);
    var world = new b2World(gravity);

    // BORDS
    let edgeUp = CreateBox("EdgeUp", canvas.width / 2, -20, 500, 20, 1.0, 0, 1.0, true, false);
    let edgeRight = CreateBox("EdgeRight", canvas.width + 20, canvas.height / 2, 20, 500, 1.0, 0, 1.0, true, false);
    let edgeDown = CreateBox("EdgeDown", canvas.width / 2, canvas.height + 20, 500, 20, 1.0, 0, 1.0, true, false);
    let edgeLeft = CreateBox("EdgeLeft", -20, canvas.height / 2, 20, 500, 1.0, 0, 1.0, true, false);

    let areaPlayerOne = CreateBox("AreaPlayerOne", 50, canvas.height / 2, 10, 400, 1.0, 0, 0.3, true, true);
    let areaPlayerTwo = CreateBox("AreaPlayerTwo", canvas.width - 50, canvas.height / 2, 10, 400, 1.0, 0, 0.9, true, true);

    let line = CreateBox("Line", canvas.width / 2, canvas.height / 2, 2, 900, 0, 0, 0, true, true);
    let playerOneSensor = CreateBox('PlayerOneSensor', 5, canvas.height / 2, 10, 900, 0, 0, 0, true, true);
    let playerTwoSensor = CreateBox('PlayerTwoSensor', canvas.width - 5, canvas.height / 2, 10, 900, 0, 0, 0, true, true);

    let playerOne = CreateBox("PlayerOne", 50, canvas.height / 2, 10, 40, 100, 0.01, 0, false, false);
    let playerTwo = CreateBox("PlayerTwo", canvas.width - 50, canvas.height / 2, 10, 40, 100, 0.01, 0, false, false);
    playerOne.isBullet = true;
    playerTwo.isBullet = true;

    let ball = RespawnBall();

    let lineJointPOne = new b2LineJoint();
    lineJointPOne.bodyA = areaPlayerOne;
    lineJointPOne.bodyB = playerOne;
    lineJointPOne.localAxisA = new b2Vec2(0, 1);

    let jointPOne = world.CreateJoint(lineJointPOne);

    let lineJointPTwo = new b2LineJoint();
    lineJointPTwo.bodyA = areaPlayerTwo;
    lineJointPTwo.bodyB = playerTwo;
    lineJointPTwo.localAxisA = new b2Vec2(0, 1);

    let jointPTwo = world.CreateJoint(lineJointPTwo);

    let timeStep = 1 / 60;

    // Définir la méthode d'affichage du débug
    var debugDraw = new b2DebugDraw();
    // Définir les propriétés d'affichage du débug
    debugDraw.SetSprite(context);       // contexte
    debugDraw.SetFillAlpha(0.3);        // transparence
    debugDraw.SetLineThickness(1.0);    // épaisseur du trait
    debugDraw.SetDrawScale(scale);      // zoom sur l'affichage

    // Affecter la méthode de l'affichage du débug du monde 2dbox
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit | b2DebugDraw.e_jointBit);
    world.SetDebugDraw(debugDraw);

    window.setInterval(() => {
        if (playerOneScore == 10) {
            context.fillText("PLAYER ONE WON !!!!", 100, canvas.height / 2);
        }
        else if (playerTwoScore == 10) {
            context.fillText("PLAYER TWO WON !!!!", 100, canvas.height / 2);
        }
        else {
            world.Step(timeStep, 10, 10);

            playerOne.SetAngle(0);
            playerTwo.SetAngle(0);

            world.DrawDebugData();
            world.ClearForces();

            // Events();

            if (mustBulletDestroyed) {
                world.DestroyBody(ball);
                ball = undefined;
                setTimeout(() => {
                    ball = RespawnBall();
                }, 3000);

                mustBulletDestroyed = false;
            }

            context.fillText(playerOneScore, canvas.width / 2 - 60, 50);
            context.fillText(playerTwoScore, canvas.width / 2 + 25, 50);
        }

    }, 100 / 6);

    function CreateFixture(types, data, x, y, dimensions, density, friction, restitution, fixed, sensor) {
        let fixDef = new b2FixtureDef();

        switch (types) {
            case 'box':
                fixDef.shape = new b2PolygonShape();
                fixDef.shape.SetAsBox(dimensions.width, dimensions.height);
                break;
            case 'polygon':
                fixDef.shape = new b2PolygonShape();
                let tabVec = dimensions.vecPos;
                fixDef.shape.SetAsArray(tabVec, tabVec.length);
                break;
            case 'ball':
                fixDef.shape = new b2CircleShape(dimensions.radius);
                break;
        }

        fixDef.isSensor = sensor;

        let bodyDef = new b2BodyDef();
        bodyDef.position.Set(x, y);
        if (fixed) bodyDef.type = b2Body.b2_staticBody;
        else {
            bodyDef.type = b2Body.b2_dynamicBody;
            fixDef.density = density;
            fixDef.friction = friction;
            fixDef.restitution = restitution;
        }

        let body = world.CreateBody(bodyDef);
        body.SetUserData(data);
        body.CreateFixture(fixDef);

        return body;
    }

    function CreateBox(data, x, y, width, height, density, friction, restitution, fixed, sensor) {
        let dimensions = {
            width: width / scale,
            height: height / scale
        };

        return CreateFixture('box', data, x / scale, y / scale, dimensions, density, friction, restitution, fixed, sensor);
    }

    function CreateBall(data, x, y, radius, density, friction, restitution, fixed, sensor) {
        let dimensions = {
            radius: radius / scale
        };

        return CreateFixture('ball', data, x / scale, y / scale, dimensions, density, friction, restitution, fixed, sensor);
    }

    function CreatePolygon(data, x, y, vecPos, density, friction, restitution, fixed, sensor) {
        let dimensions = {
            vecPos: vecPos
        };

        return CreateFixture('polygon', data, x / scale, y / scale, dimensions, density, friction, restitution, fixed, sensor);
    }

    function AddForce(body, direction) {
        body.SetLinearVelocity(direction);
    }

    function RespawnBall() {
        let ball = CreateBall("Ball", canvas.width / 2 - 5, canvas.height / 2, 10, 1.0, 0, 1.0, false, false);
        ball.isBullet = true;

        startDirection = new b2Vec2(Math.random() * 25, Math.random() * 25);
        AddForce(ball, startDirection);
        return ball;
    }

    // function Events() {
    //     if (keys.length > 0) {
    //         if (keys.indexOf("ArrowUp") != -1) {
    //             AddForce(playerTwo, new b2Vec2(0, -20));
    //             return;
    //         }
    //         if (keys.indexOf("ArrowDown") != -1) {
    //             AddForce(playerTwo, new b2Vec2(0, 20));
    //             return;
    //         }
    //         if (keys.indexOf("z") != -1) {
    //             AddForce(playerOne, new b2Vec2(0, -20));
    //             return;
    //         }
    //         if (keys.indexOf("s") != -1) {
    //             AddForce(playerOne, new b2Vec2(0, 20));
    //             return;
    //         }
    //         if (keys.indexOf("r") != -1 && ball != undefined) {
    //             mustBulletDestroyed = true;
    //             return;
    //         }
    //         else {
    //             playerTwo.SetLinearVelocity(new b2Vec2(0, 0));
    //             return;
    //         }
    //     }
    // }

    function onKey(event) {
        const touchName = event.key;

        if (touchName === 'ArrowUp') {
            let direction = new b2Vec2(0, -20);
            AddForce(playerTwo, direction);
        }
        if (touchName === 'ArrowDown') {
            let direction = new b2Vec2(0, 20);
            AddForce(playerTwo, direction);
        }
        if (touchName === 'z') {
            let direction = new b2Vec2(0, -20);
            AddForce(playerOne, direction);
            return;
        }
        if (touchName === 's') {
            let direction = new b2Vec2(0, 20);
            AddForce(playerOne, direction);
            return;
        }
        if (touchName === 'r') {
            mustBulletDestroyed = true;
        }
    }

    function keyUp(event) {
        const touchName = event.key;

        if (touchName === 'ArrowUp' || touchName === 'ArrowDown') {
            let direction = new b2Vec2(0, 0);
            AddForce(playerTwo, direction);
        }
        if (touchName === 'z' || touchName === 's') {
            let direction = new b2Vec2(0, 0);
            AddForce(playerOne, direction);
            return;
        }
    }

    document.addEventListener('keydown', onKey);
    document.addEventListener('keyup', keyUp);

    var listener = new Box2D.Dynamics.b2ContactListener;
    listener.BeginContact = function (contact) {
        let fixA = contact.GetFixtureA();
        let fixB = contact.GetFixtureB();

        let bodyA = fixA.GetBody();
        let BodyB = fixB.GetBody();

        if ((BodyB.GetUserData() == "PlayerOneSensor" || BodyB.GetUserData() == "Ball")
            && (bodyA.GetUserData() == "Ball" || bodyA.GetUserData() == "PlayerOneSensor")) {
            mustBulletDestroyed = true;
            playerTwoScore += 1;
        }
        if ((BodyB.GetUserData() == "PlayerTwoSensor" || BodyB.GetUserData() == "Ball")
            && (bodyA.GetUserData() == "Ball" || bodyA.GetUserData() == "PlayerTwoSensor")) {
            mustBulletDestroyed = true;
            playerOneScore += 1;
        }
    }

    world.SetContactListener(listener);
};