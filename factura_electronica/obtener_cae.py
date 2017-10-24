#!/usr/local/bin/python
# -*- coding: utf-8 -*-from __future__ import unicode_literals
import frappe
from frappe import _

@frappe.whitelist()
def obtenerDatoSales(factura):
    '''Obtiene el cae de la factura electronica generada, segun la serie de la factura original,
       en caso no exista el cae, se retornara un valor en blanco.'''
    try:
        cae_dato = frappe.db.sql("""
                select cae
                from `tabEnvios Facturas Electronicas` where serie_factura_original = %s
                """,factura , as_dict=True)
        datoCae = str(cae_dato[0]['cae'])
    except:
        # frappe.msgprint(_('Factura no tiene CAE'))
        datoCae = " "

    return str(datoCae)