require('dotenv').config()
const { Product } = require('../models/')
const router = require('express').Router()
const joi = require('joi')
const validate = require('express-validation')
const jwt = require('jsonwebtoken')

const validation = require('../middleware/validation')
const isLoggedIn = require('../middleware/login')

router.get('/', async (req, res) => {
  try {
    const limit = Number(req.query.limit || 10)
    const offset = Number(req.query.page || 0) * limit
    console.log(offset)

    const result = await Product.findAll({
      limit,
      offset
    })
    console.log('all Product', result)
    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ err, isError: true })
  }
})

router.post(
  '/create',
  validate({
    body: {
      nama: joi.string().required(),
      harga: joi.string().required(),
      stock: joi.string().required(),
      photoUrl: joi.string().required()
    },
    options: {
      allowUnknownBody: false
    }
  }),
  isLoggedIn,
  async (req, res) => {
    try {
      const body = req.body
      const result = await Product.create({ ...body, userId: req.stateId })
      res.json(result)
    } catch (err) {
      console.error(err)
      res.status(500).json({ err, isError: true })
    }
  }
)

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const result = await Product.findOne({
      where: {
        id
      }
    })
    console.log('One Product', result)
    if (result) res.json(result)
    else res.status(404).json({ isError: true, errorMsg: 'Product Not Found' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ err, isError: true })
  }
})

router.put(
  '/:id/edit',
  validate({
    params: {
      id: joi.number().required()
    },
    body: {
      nama: joi.string().required(),
      harga: joi.string().required(),
      stock: joi.string().required(),
      photoUrl: joi.string().required()
    },
    options: {
      allowUnknownBody: false
    }
  }),
  isLoggedIn,
  async (req, res) => {
    try {
      const productId = Number(req.params.id)
      const userId = Number(req.stateId)

      const isProductValid = await Product
      const result = await Product.findOne({ where: { id: productId, userId } })
      console.log('Edit One Product', result)
      if (!result)
        return res
          .status(404)
          .json({ isError: true, errorMsg: 'Product Not Found' })
      else {
        const body = req.body
        const result = await Product.update(body, {
          where: {
            id: productId
          }
        })
        res.json(result)
      }
    } catch (err) {
      console.error(err)
      res.status(500).json({ err, isError: true })
    }
  }
)

module.exports = router