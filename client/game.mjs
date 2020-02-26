const TOTAL_VOLUME = 369
let AVAILABLE_VOLUME = TOTAL_VOLUME
let MAP = ''

export function startGame(levelMap, gameState) {
	MAP = levelMap
	AVAILABLE_VOLUME = TOTAL_VOLUME
}


export function getNextCommand(gameState) {
	console.log(gameState)

	setAvailableVolume(gameState)
	console.log(AVAILABLE_VOLUME)

	if (isPort(gameState) === 'isHome' && AVAILABLE_VOLUME > 4) {
		return `LOAD fabric ${maxValueOfGoods(gameState.goodsInPort[0])}`
	} else if (isPort(gameState) !== 'isPort' && AVAILABLE_VOLUME < TOTAL_VOLUME) {
		return 'N'
	} else if (isPort(gameState) === 'isPort' && AVAILABLE_VOLUME < TOTAL_VOLUME) {
		return `SELL ${gameState.ship.goods[0].name} ${gameState.ship.goods[0].amount}`
	} else {
		return 'S'
	}

}

function isPort(gameState) {
	const { ship, ports } = gameState
	if (ports.filter(({ x, y, isHome }) => x === ship.x && y === ship.y && isHome === true).length > 0) {
		return 'isHome'
	} else if (ports.filter(({ x, y, isHome }) => x === ship.x && y === ship.y && isHome === false).length > 0) {
		return 'isPort'
	} else {
		return false
	}
}

function maxValueOfGoods(oneTypeOfGoods) {
	const { volume } = oneTypeOfGoods
	if (AVAILABLE_VOLUME % volume === 0) {
		return AVAILABLE_VOLUME / volume - 1
	} else {
		return AVAILABLE_VOLUME / volume
	}
}

function setAvailableVolume(allData) {
	const { goodsInPort, ship } = allData
	const { goods } = ship
	if (goods.length > 0) {
		goods.forEach(el => {
			const { volume } = goodsInPort.filter(({ name }) => name === el.name)[0]
			AVAILABLE_VOLUME = TOTAL_VOLUME - el.amount * volume
		});
	} else {
		AVAILABLE_VOLUME = TOTAL_VOLUME
	}
}
