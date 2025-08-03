import './Sprites.css'

function RenderMover(props) {
    let dir = props.direction || "right";
    dir.toLowerCase();
    dir = dir[0].toUpperCase() + dir.slice(1).toLowerCase(); // Capitalize
    return (
        <div className='block'>
            <img src={`/src/assets/sprites/${dir}Mover.png`} className='block'/>
        </div>
    );
}

function RenderSpawned(props) {
    let spawn = props.spawn || "";
    let dir = props.direction || "Right";
    if (spawn == "") return null;
    return <img src={`/src/assets/sprites/${spawn}.png`} className={`inside${dir}Spawner`}/>
}

function RenderSpawner(props) {
    let dir = props.direction || "right";
    let spawn = props.spawn || "";
    dir.toLowerCase();
    spawn.toLowerCase();

    dir = dir[0].toUpperCase() + dir.slice(1).toLowerCase(); // Capitalize
    return (
        <div className='block'>
            <div className="spawner">
                <img src={`/src/assets/sprites/${dir}Spawner.png`} />
                <RenderSpawned spawn={spawn} direction={dir}/>
            </div>
        </div>
        
    );
}

function RenderWalker(props) {
    let dir = props.direction || "right";
    let color = props.color || "blue";
    dir.toLowerCase();
    color.toLowerCase();

    dir = dir[0].toUpperCase() + dir.slice(1).toLowerCase();     // Capitalize
    color = color[0].toUpperCase() + color.slice(1).toLowerCase(); // Capitalize

    return (
        <div className='block'>
            <img src={`/src/assets/sprites/${dir}${color}Walker.png`} />
        </div>
    );
}

function RenderTeleportCircle(props) {
    let dir = props.direction || "";
    let color = props.color || "";
    if (dir == "" || color == "") return null;
    dir.toLowerCase();
    color.toLowerCase();

    return <span style={{ backgroundColor: color}} className={`teleportCircle ${dir}TeleportCircle`}></span>
}

function RenderTeleporter(props) {
    let leftColor = props.leftColor || "";
    let rightColor = props.rightColor || "";
    let upColor = props.upColor || "";
    let downColor = props.downColor || "";
    return (
        <div className='block'>
            <div className="teleporter">
                <img src={`/src/assets/sprites/Teleporter.png`} />
                <RenderTeleportCircle direction="up" color={upColor} />
                <RenderTeleportCircle direction="down" color={downColor} />
                <RenderTeleportCircle direction="right" color={rightColor} />
                <RenderTeleportCircle direction="left" color={leftColor} />
            </div>
        </div>
        
    );
}

function RenderStone() {
    return (
        <div className='block'>
            <img src={`/src/assets/sprites/Stone.png`} />
        </div>
    )
}

function RenderDestroyer() {
    return (
        <div className='block'>
            <img src={`/src/assets/sprites/Destroyer.png`} />
        </div>
    )
}

function RenderNormal(props) {
    let color = props.color || "blue";
    color.toLowerCase();

    color = color[0].toUpperCase() + color.slice(1).toLowerCase(); // Capitalize

    return (
        <div className='block'>
            <img src={`/src/assets/sprites/${color}Block.png`} />
        </div>
    )
}

function RenderRotater(props) {
    let dir = props.direction || "clockwise";
    dir.toLowerCase();
    dir = dir[0].toUpperCase() + dir.slice(1).toLowerCase(); // Capitalize

    return (
        <div className='block'>
            <img src={`/src/assets/sprites/${dir}Rotater.png`} />
        </div>
    )
}

function RenderBlock(props) {
    let type = props.type || "stone";
    type = type.toLowerCase();

    if (type == "mover") {
        return <RenderMover direction={props.direction} />
    } else if (type == "spawner") {
        return <RenderSpawner direction={props.direction} spawn={props.spawn}/>
    } else if (type == "walker") {
        return <RenderWalker direction={props.direction} color={props.color}/>
    } else if (type == "teleporter") {
        return <RenderTeleporter upColor={props.upColor} downColor={props.downColor} rightColor={props.rightColor} leftColor={props.leftColor} />
    } else if (type == "rotater") {
        return <RenderRotater direction={props.direction} />
    } else if (type == "normal") {
        return <RenderNormal color={props.color} />
    } else if (type == "destroyer") {
        return <RenderDestroyer />
    } else {
        return <RenderStone />
    }
}

export {
    RenderMover,
    RenderSpawner,
    RenderWalker,
    RenderTeleporter,
    RenderStone,
    RenderDestroyer,
    RenderNormal,
    RenderRotater,
    RenderBlock,
};
