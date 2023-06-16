class DrawingBoard {
    isMouseDown = false;
    isNavigatorVisible = false;
    undoArray = [];
    CLASS_NAME = {
        active: "active",
        hide: "hide"
    };
    CURSOR_VALUE = {
        default: "default",
        active: "crosshair"
    };
    COLOR_VALUE = {
        eraser: "#fff",
        background: "#fff"
    };
    MODE = {
        none: "NONE",
        brush: "BRUSH",
        eraser: "ERASER"
    };
    STATUS = "NONE";
    container;
    canvas;
    toolbar;
    brush;
    brushPanel;
    brushSize;
    brushSizeLabel;
    brushSizePreview;
    colorPicker;
    eraser;
    navigator;
    navigatorContainer;
    navigatorIMG;
    undo;
    clear;
    btnDownload;
    constructor(){
        this.assignElement();
        this.initContext();
        this.initCanvasBackground();
        this.addEvent();
    }
    assignElement() {
        this.container = document.querySelector("#container");
        this.canvas = this.container.querySelector("#canvas");
        this.toolbar = this.container.querySelector("#toolbar");
        this.brush = this.toolbar.querySelector("#brush");
        this.brushPanel = this.container.querySelector("#brushPanel");
        this.brushSize = this.brushPanel.querySelector("#brushSize");
        this.brushSizeLabel = this.brushPanel.querySelector(".brushSizeLabel");
        this.brushSizePreview = this.brushPanel.querySelector("#brushSizePreview");
        this.colorPicker = this.toolbar.querySelector("#colorPicker");
        this.eraser = this.toolbar.querySelector("#eraser");
        this.navigator = this.toolbar.querySelector("#navigator");
        this.navigatorContainer = this.container.querySelector("#imgNav");
        this.navigatorIMG = this.navigatorContainer.querySelector("#canvasImg");
        this.undo = this.toolbar.querySelector("#undo");
        this.clear = this.toolbar.querySelector("#clear");
        this.btnDownload = this.toolbar.querySelector("#download");
    }
    initContext() {
        this.context = this.canvas.getContext("2d");
    }
    initCanvasBackground() {
        this.context.fillStyle = this.COLOR_VALUE.background;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    addEvent() {
        this.brush.addEventListener("click", this.onClickBrush.bind(this));
        this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
        this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
        this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
        this.canvas.addEventListener("mouseout", this.onMouseOut.bind(this));
        this.brushSize.addEventListener("input", this.onChangeBrushSize.bind(this));
        this.colorPicker.addEventListener("input", this.onChangeColor.bind(this));
        this.eraser.addEventListener("click", this.onClickeraser.bind(this));
        this.navigator.addEventListener("click", this.onClickNavigator.bind(this));
        this.undo.addEventListener("click", this.onClickUndo.bind(this));
        this.clear.addEventListener("click", this.onClickClear.bind(this));
        this.btnDownload.addEventListener("click", this.onClickDownload.bind(this));
    }
    onClickDownload(e) {
        this.btnDownload.href = this.canvas.toDataURL("image/jpg", 1);
        this.btnDownload.download = "image.jpeg";
    }
    onClickClear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.undoArray = [];
        this.updateNavigator();
        this.initCanvasBackground();
    }
    onClickUndo() {
        if (this.undoArray.length === 0) {
            alert("더이상 실행 취소 불가");
            return;
        }
        let prevDataUrl = this.undoArray.pop();
        let prevImg = new Image();
        prevImg.onload = ()=>{
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.drawImage(prevImg, 0, 0, this.canvas.width, this.canvas.height, 0, 0, this.canvas.width, this.canvas.height);
        };
        prevImg.src = prevDataUrl;
        if (this.isNavigatorVisible) this.navigatorIMG.src = prevDataUrl;
    }
    saveState() {
        if (this.undoArray.length > 9) {
            this.undoArray.shift();
            this.undoArray.push(this.canvas.toDataURL());
        } else this.undoArray.push(this.canvas.toDataURL());
    }
    updateNavigator() {
        if (!this.isNavigatorVisible) return;
        this.navigatorIMG.src = this.canvas.toDataURL();
    }
    onChangeColor(e) {
        this.brushSizePreview.style.background = e.target.value;
    }
    onChangeBrushSize(e) {
        this.brushSizeLabel.innerHTML = `${e.target.value} Size`;
        this.brushSizePreview.style.width = `${e.target.value}px`;
        this.brushSizePreview.style.height = `${e.target.value}px`;
    }
    onMouseOut() {
        if (this.STATUS === this.MODE.none) return;
        this.isMouseDown = false;
    }
    onMouseUp() {
        if (this.STATUS === this.MODE.none) return;
        this.isMouseDown = false;
        this.updateNavigator();
    }
    onMouseMove(e) {
        if (!this.isMouseDown) return;
        const currentPosition = this.getMousePosition(e);
        this.context.lineTo(currentPosition.x, currentPosition.y);
        this.context.stroke();
        this.updateNavigator();
    }
    onMouseDown(e) {
        if (this.STATUS === this.MODE.none) return;
        this.isMouseDown = true;
        const currentPosition = this.getMousePosition(e);
        this.context.beginPath();
        this.context.moveTo(currentPosition.x, currentPosition.y);
        this.context.lineCap = "round";
        if (this.STATUS === this.MODE.brush) {
            this.context.strokeStyle = this.colorPicker.value;
            this.context.lineWidth = this.brushSize.value;
        } else if (this.STATUS === this.MODE.eraser) {
            this.context.strokeStyle = this.COLOR_VALUE.eraser;
            this.context.lineWidth = 50;
        }
        this.saveState();
    }
    getMousePosition(e) {
        const boundaries = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - boundaries.left,
            y: e.clientY - boundaries.top
        };
    }
    onClickBrush(e) {
        const isActive = e.currentTarget.classList.contains(this.CLASS_NAME.active);
        this.STATUS = isActive ? this.MODE.none : this.MODE.brush;
        this.canvas.style.cursor = isActive ? this.CURSOR_VALUE.default : this.CURSOR_VALUE.active;
        e.currentTarget.classList.toggle(this.CLASS_NAME.active);
        this.brushPanel.classList.toggle(this.CLASS_NAME.hide);
        this.eraser.classList.remove(this.CLASS_NAME.active);
    }
    onClickeraser(e) {
        const isActive = e.currentTarget.classList.contains(this.CLASS_NAME.active);
        this.STATUS = isActive ? this.MODE.none : this.MODE.eraser;
        this.canvas.style.cursor = isActive ? this.CURSOR_VALUE.default : this.CURSOR_VALUE.active;
        e.currentTarget.classList.toggle(this.CLASS_NAME.active);
        this.brush.classList.remove(this.CLASS_NAME.active);
        this.brushPanel.classList.add(this.CLASS_NAME.hide);
    }
    onClickNavigator(e) {
        this.isNavigatorVisible = !e.currentTarget.classList.contains(this.CLASS_NAME.active);
        e.currentTarget.classList.toggle(this.CLASS_NAME.active);
        this.navigatorContainer.classList.toggle(this.CLASS_NAME.hide);
        this.updateNavigator();
    }
}
new DrawingBoard();

//# sourceMappingURL=index.de5c0784.js.map
