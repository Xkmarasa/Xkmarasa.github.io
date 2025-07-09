class Plato:
    def __init__(self, id=None, price=None, description=None, imagen=None):
        self.id = id
        self.price = price
        self.description = description
        self.imagen = imagen

    def to_dict(self):
        return {
            "id": self.id,
            "price": self.price,
            "description": self.description,
            "imagen": self.imagen
        }