var Style = {};

Style.color = {
    "default": 0xffe0ff,
    "highlight": 0xff40ff,
};

Style.text = {
    "default": {
        "color": "#"+Style.color.default.toString(16),
    },
    "highlight": {
        "color": "#ff40ff"
    },
    "disabled": {
        "color": "#c060c0"
    },
};
