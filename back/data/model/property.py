class Property:
    def __init__(self, id=None, price=None, description=None, ubi=None, baños=None, tamaño=None, construido=None, terraza=None):
        self.id = id
        self.price = price
        self.description = description
        self.ubi = ubi  # ubicación
        self.baños = baños
        self.tamaño = tamaño
        self.construido = construido
        self.terraza = terraza

    def to_dict(self):
        return {
            "id": self.id,
            "price": self.price,
            "description": self.description,
            "ubi": self.ubi,
            "baños": self.baños,
            "tamaño": self.tamaño,
            "construido": self.construido,
            "terraza": self.terraza
        }