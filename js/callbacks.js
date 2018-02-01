/* global game */
function highlight(item, pointer, color)
{
    item.fill = color;
}

function tint(item, pointer, color)
{
    item.tint = color;
}

function onClickGoto(who, pointer, scene)
{
    game.state.start(scene);
}

function goto(scene)
{
    game.state.start(scene);
}