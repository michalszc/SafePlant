interface Flower {
  name: string
  humidity: {
    frequency: number
    validRange: {
      max: number
      min: number
    }
  }
  temperature: {
    frequency: number
    validRange: {
      max: number
      min: number
    }
  }
}

export default Flower
