const TOTAL_VOLUME = 368
let AVAILABLE_VOLUME = TOTAL_VOLUME
let MAP = []
let NEW_GOODS_ARR = []

export function startGame(levelMap, gameState) {
	AVAILABLE_VOLUME = TOTAL_VOLUME
	generateMap(levelMap, gameState)
	cofficentOfBenefit(gameState)
}


export function getNextCommand(gameState) {

	console.log('startGame: ', gameState)
	setAvailableVolume(gameState)

	wayToPort(gameState, MAP)

	if (isPossibleToLoadGoods(NEW_GOODS_ARR).length > 0 && whereAmI(gameState, MAP) === 'home') {
		return `LOAD ${loadGoodsIsPossible(isPossibleToLoadGoods(NEW_GOODS_ARR)).name} ${loadGoodsIsPossible(isPossibleToLoadGoods(NEW_GOODS_ARR)).amount}`
	}
	if (!isPossibleToLoadGoods(NEW_GOODS_ARR).length > 0 && whereAmI(gameState, MAP) !== 'port') {
		return 'N'
	}
	if (isPossibleToSellGoods(gameState) && whereAmI(gameState, MAP) === 'port') {
		return `SELL ${isPossibleToSellGoods(gameState).name} ${isPossibleToSellGoods(gameState).amount}`
	}
	if (!isPossibleToSellGoods(gameState) && whereAmI(gameState, MAP) !== 'home') {
		return 'S'
	}
}

function setAvailableVolume(gameState) {
	const { goodsInPort, ship } = gameState
	const { goods } = ship
	let availableVolumeVar = TOTAL_VOLUME
	if (goods.length > 0) {
		goods.forEach(el => {
			const { volume } = goodsInPort.filter(({ name }) => name === el.name)[0]
			const curGoodsVolume = el.amount * volume
			availableVolumeVar = availableVolumeVar - curGoodsVolume
		});
		AVAILABLE_VOLUME = availableVolumeVar
	} else {
		AVAILABLE_VOLUME = TOTAL_VOLUME
	}
}

function generateMap(levelMap, gameState) {
	const { ports } = gameState
	const fullMapArray = levelMap.split('\n')
	const fullMapNewArray = []
	fullMapArray.map(element => {
		const xAxis = []
		for (let key in element) {
			xAxis.push({
				x: +key,
				type: generateMapItemType(element[key])
			})
		}
		fullMapNewArray.push(xAxis)
	})
	ports.forEach(port => {
		fullMapNewArray[port.y][port.x]['isHome'] = port.isHome
		fullMapNewArray[port.y][port.x]['portId'] = port.portId
	})
	MAP = fullMapNewArray
}

function generateMapItemType(symbol) {
	switch (symbol) {
		case '~':
			return 'water'
		case '#':
			return 'land'
		case 'O':
			return 'port'
		case 'H':
			return 'home'
		default:
			return false
	}
}


function isPossibleToLoadGoods(newGoodsArr) {
	let possibleAvailableVolume = AVAILABLE_VOLUME
	const minVolumePerUnit = Math.min.apply(null, newGoodsArr.map(el => el.volume))
	const someGoods = []

	newGoodsArr.forEach(el => {
		const totalAvailableVolumePerGoods = possibleAvailableVolume
		const possibleAmountOfThisGoods = parseInt(possibleAvailableVolume / el.volume)

		possibleAvailableVolume = totalAvailableVolumePerGoods - possibleAmountOfThisGoods * el.volume
		if (possibleAmountOfThisGoods !== 0) {
			someGoods.push({ ...el, possibleAmount: possibleAmountOfThisGoods })
		}
		if (possibleAvailableVolume + minVolumePerUnit < TOTAL_VOLUME) {
			return
		}
	})
	return someGoods
}

function loadGoodsIsPossible(arrOfGoods) {
	if (arrOfGoods.length > 0) {
		return {
			name: arrOfGoods[0].name,
			amount: arrOfGoods[0].possibleAmount
		}
	} else {
		return false
	}
}

function cofficentOfBenefit(gameState) {
	const { goodsInPort, prices } = gameState
	const newArr = []
	goodsInPort.forEach(goods => {
		prices.forEach(port => {
			newArr.push({
				name: goods.name,
				amount: goods.amount,
				volume: goods.volume,
				corfficentOfBenefit: port[goods.name] / goods.volume
			})
		})
	})
	NEW_GOODS_ARR = newArr.sort((a, b) => a.cofficentOfBenefit < b.cofficentOfBenefit ? 1 : -1)
}

function whereAmI(gameState, newMap) {
	const { ship } = gameState
	const curCoordinates = newMap[ship.y].filter(el => el.x === ship.x)[0]
	return curCoordinates.type
}

function isPossibleToSellGoods(gameState) {
	const { ship } = gameState
	if (ship.goods.length > 0) {
		return { ...ship.goods[0] }
	} else {
		return false
	}
}

function nextDestination(gameState) {
	const { ship } = gameState
	if (ship.goods.length > 0) {
		return 'toSellGoods'
	} else {
		return 'toLoadGoods'
	}
}

function wayToPort(gameState, newMap) {
	const { ship, ports } = gameState
	if (nextDestination(gameState) === 'toLoadGoods') {
		const home = ports.filter(port => port.isHome)[0]
		direction(home.y, ship.y, 'y')
		direction(home.x, ship.x, 'x')
	}
	if (nextDestination(gameState) === 'toSellGoods') {
		const port = ports.filter(port => !port.isHome)[0]
		direction(port.y, ship.y, 'y')
		direction(port.x, ship.x, 'x')
	}
}

function direction(destinationCoord, startCoord, axis) {
	if (destinationCoord < startCoord && axis === 'y'){
		return 'N'
	}
	if (destinationCoord > startCoord && axis === 'y'){
		return 'S'
	}
	if (destinationCoord < startCoord && axis === 'x'){
		return 'W'
	}
	if (destinationCoord < startCoord && axis === 'x'){
		return 'E'
	}
}