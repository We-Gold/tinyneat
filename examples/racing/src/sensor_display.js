export class SensorDisplay {
	constructor(p, x, y) {
		this.p = p
		this.pixelWidth = 10
		this.x = x
		this.y = y
	}

	showSensors(sensors) {
		let x = this.x
		this.p.noStroke()
		this.p.fill(255)
		this.p.rect(
			this.x - 1,
			this.y - 1,
			this.pixelWidth * sensors.length + 2,
			this.pixelWidth + 2,
		)
		sensors.forEach(s => {
			this.p.noStroke()
			this.p.fill(s[0], s[1], s[2], s[3])
			this.p.rect(x, this.y, this.pixelWidth, this.pixelWidth)
			x += this.pixelWidth
		})
	}
}
