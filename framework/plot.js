class Plot {
    constructor(width, height, root) {
        /** @type {HTMLCanvasElement} */
        this.canvas = document.createElement('canvas')
        this.canvas.width = width
        this.canvas.height = height
        root.append(this.canvas)
        this.ctx = this.canvas.getContext('2d')
    }

    plot1d(value) {
        if(value.length==0) return value

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        const max_points = this.canvas.width*2

        if (value.length > max_points) {
            let old_value = value
            value = []
            for (let i = 0; i < max_points; i++) {
                let j = Math.round(i / max_points * old_value.length)
                value.push(old_value[j])
            }
        }

        const max_val = value.reduce((a, b) => Math.max(a, b))
        const min_val = value.reduce((a, b) => Math.min(a, b))
        const val_range = max_val - min_val

        const margin = 10
        const origin_x = margin / 2
        const origin_y = margin / 2

        const plot_width = this.canvas.width - margin
        const plot_height = this.canvas.height - margin

        const len = value.length
        this.ctx.beginPath()
        for (let i = 0; i < len; i++) {
            let x = i / len * plot_width + origin_x
            let y = (1 - (value[i] - min_val) / val_range) * plot_height + origin_y
            if (i == 0) this.ctx.moveTo(x, y)
            else this.ctx.lineTo(x, y)
        }
        this.ctx.stroke()
        return value
    }
}