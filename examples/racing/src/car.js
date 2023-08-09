import p5 from "../p5.js"

const VIEW_DISTANCE = 50
const PIXELS = 15
const VIEW_ANGLE = 120

const CAR_WIDTH = 20
const CAR_LENGTH = 40

const ANGLE_TO_CORNER =
	(Math.atan(CAR_WIDTH / 2 / (CAR_LENGTH / 2)) * 180) / Math.PI
const DIST_TO_CORNER = Math.hypot(CAR_WIDTH / 2, CAR_LENGTH / 2)

const ROTATION_RATE = 8 // 7
const CAR_SPEED = 6 // 4

export class Car {
	constructor(p, x, y, dir) {
		this.x = x
		this.y = y
		this.dir = p5.Vector.fromAngle(p.radians(dir))
		this._x = x
		this._y = y
		this._dir = p5.Vector.fromAngle(p.radians(dir))
		this.sensors = []
		this.sensedPoints = []
		this.inputs = []
		this.p = p
		this.speed = CAR_SPEED
	}

	resetPosition() {
		this.x = this._x
		this.y = this._y
		this.dir = p5.Vector.fromAngle(this._dir.heading())
	}

	getPointAtDistance(dist, angle) {
		const pos = p5.Vector.fromAngle(
			this.dir.heading() + this.p.radians(angle),
			dist,
		)

		const x = this.x + pos.x
		const y = this.y + pos.y

		this.sensedPoints.push([x, y])

		return this.getPixel(x, y)
	}

	getPixel(x, y) {
		// Requires that the loadPixels() function has been run
		x = Math.round(x)
		y = Math.round(y)
		let start = 4 * (y * this.p.width + x)
		return [
			this.p.pixels[start],
			this.p.pixels[start + 1],
			this.p.pixels[start + 2],
			this.p.pixels[start + 3],
		]
	}

	isOffTrack() {
		const offTrackIndex = 0

		const frontLeftOffTrack =
			this.classifySensorInts(
				this.getPointAtDistance(DIST_TO_CORNER, ANGLE_TO_CORNER),
			) === offTrackIndex
		const frontRightOffTrack =
			this.classifySensorInts(
				this.getPointAtDistance(DIST_TO_CORNER, -ANGLE_TO_CORNER),
			) === offTrackIndex
		const backLeftOffTrack =
			this.classifySensorInts(
				this.getPointAtDistance(-DIST_TO_CORNER, -ANGLE_TO_CORNER),
			) === offTrackIndex
		const backRightOffTrack =
			this.classifySensorInts(
				this.getPointAtDistance(-DIST_TO_CORNER, ANGLE_TO_CORNER),
			) === offTrackIndex

		return (
			frontLeftOffTrack ||
			backLeftOffTrack ||
			frontRightOffTrack ||
			backRightOffTrack
		)
	}

	sense() {
		this.sensors = []
		this.sensedPoints = []
		for (
			let s = -VIEW_ANGLE / 2;
			s <= VIEW_ANGLE / 2;
			s += VIEW_ANGLE / PIXELS
		) {
			this.sensors.push(this.getPointAtDistance(VIEW_DISTANCE, s))
		}
	}

	classifySensor(sensor) {
		let offset = 30
		let knownColors = {
			green: 344,
			black: 0,
		}
		let sensedColor = sensor[0] + sensor[1] + sensor[2]

		let colorsArr = Object.keys(knownColors)

		let classifiedColor = null

		colorsArr.forEach(color => {
			if (this.p.abs(sensedColor - knownColors[color]) <= offset) {
				classifiedColor = color
			}
		})

		return classifiedColor
	}

	classifySensorInts(sensor) {
		let offset = 30
		let knownColors = [344, 0]
		let sensedColor = sensor[0] + sensor[1] + sensor[2]

		let classifiedColor = 0

		let i = 0
		knownColors.forEach(color => {
			if (this.p.abs(sensedColor - color) <= offset) {
				classifiedColor = i
			}
			i++
		})

		return classifiedColor
	}

	classifySensorsInts(sensors) {
		let classified = []
		sensors.forEach(sensor => {
			classified.push(this.classifySensorInts(sensor))
		})
		return classified
	}

	classifySensors(sensors) {
		let classified = []
		sensors.forEach(sensor => {
			classified.push(this.classifySensor(sensor))
		})
		return classified
	}

	getInputs() {
		this.inputs = this.classifySensorsInts(this.sensors)
		return this.inputs
	}

	receiveOutput([angle, speed]) {
		this.rotateCar(angle * ROTATION_RATE)
		this.speed = speed * CAR_SPEED

		// Reward the individual based on the number of black pixels it can see
		const reward =
			this.inputs.reduce((acc, curr) => (curr === 1 ? acc + 1 : acc), 0) /
				this.inputs.length +
			this.speed / (2 * CAR_SPEED)

		return reward
	}

	stayInLane() {
		let classified = this.classifySensors(this.sensors)

		let leftDistToBlack = 0
		let rightDistToBlack = classified.length - 1

		while (
			classified[leftDistToBlack] != "black" &&
			leftDistToBlack < classified.length
		) {
			leftDistToBlack++
		}

		while (
			classified[rightDistToBlack] != "black" &&
			rightDistToBlack >= 0
		) {
			rightDistToBlack--
		}

		rightDistToBlack = classified.length - 1 - rightDistToBlack

		let angle = ROTATION_RATE * (leftDistToBlack - rightDistToBlack)

		// if (this.modelTrained) {
		// 	this.model.predictItem(classifiedInts).then((val) => {
		// 		this.rotateCar(val)
		// 	})
		// } else {
		this.rotateCar(angle)
		// }
	}

	rotateCar(angle) {
		this.dir.rotate(this.p.radians(angle))
	}

	move() {
		this.x += this.dir.x * CAR_SPEED
		this.y += this.dir.y * CAR_SPEED
	}

	render() {
		this.p.fill(255)
		this.p.noStroke()
		this.p.push()
		this.p.translate(this.x, this.y)
		this.p.rotate(this.dir.heading())
		this.p.rectMode(this.p.CENTER)
		this.p.rect(0, 0, CAR_LENGTH, CAR_WIDTH)
		this.p.rectMode(this.p.CORNER)
		this.p.fill(255, 0, 0)
		this.p.rect(
			CAR_LENGTH / 2 - CAR_LENGTH / 4,
			-CAR_WIDTH / 2,
			CAR_LENGTH / 4,
			CAR_WIDTH,
		)
		this.p.pop()

		// Render the raycasts
		this.p.stroke(255)

		for (const [x, y] of this.sensedPoints)
			this.p.line(this.x, this.y, x, y)
	}
}
