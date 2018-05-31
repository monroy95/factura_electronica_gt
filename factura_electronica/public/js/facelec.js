console.log("Se cargo exitosamente la aplicación de Factura Electronica");
/*
# en-US: Index for Factura Electronica App
This JavaScript file contains the functions that run on the client machine.
It is organized into two main sections: One for functions, another for triggers
1. Functions
1.1 en-US: Tax Calculation Conversions
1.2 en-US: Search Tax Account
1.3 en-US: Validate Tax ID (NIT)
1.4 en-US: Obtain Electronic Invoice PDF
1.5 en-US: Generate Electronic Invoice Manually with Button Press
1.6 en-US: Generate Electronic Invoice Automatically
1.7 en-US: Generate Electronic Invoice if CAE not present
1.8 en-US: Tax Calculation Conversions for Purchase Invoice
1.9 en-US: Tax Calculation Conversions for Cotizacion de Compra
1.10 en-US: Tax Calculation Conversions for Quotation Item
1.11 en-US: Tax Calculation Conversions for Purchase Receipt
1.12 en-US: Tax Calculation Conversions for Sales Order
1.13 en-US: Tax Calculation Conversions for Delivery Note
1.14 en-US: Tax Calculation Conversions for Supplier Quotation

2. Triggers
2.1 en-US: Triggers for Sales Invoice
2.2 en-US: Triggers for Sales Invoice Items
2.3 en-US: Triggers for Purchase Invoice
2.4 en-US: Triggers for Purchase Invoice Items
2.5 en-US: Triggers for Quotation
2.6 en-US: Triggers for Quotation Item
2.7 en-US: Triggers for Purchase Order
2.8 en-US: Triggers for Purchase Order Items
2.9 en-US: Triggers for Purchase Receipt
2.10 en-US: Triggers for Purchase Receipt Item
2.11 en-US: Triggers for Sales Order
2.12 en-US: Triggers for Sales Order Item
2.13 en-US: Triggers for Delivery Note
2.14 en-US: Triggers for Delivery Note Item
2.15 en-US: Triggers for Supplier Quotation
2.16 en-US: Triggers for Supplier Quotation Item

# es-GT: Indice para Aplicacion Factura Electronica
Este archivo JavaScript contiene las funciones que corren en la máquina del cliente
Esta organizado en dos principales secciones: Una para funciones, otra para disparadores
1. Funciones
1.1 es-GT: Calculos y Conversiones de impuestos EMPIEZA
1.2 es-GT: Busqueda de Cuenta de Impuestos
1.3 es-GT: Validar NIT
1.4 es-GT: Obtener PDF de Factura Electronica
1.5 es-GT: Genera la Factura Electronica Manualmente presionando el Botón
1.6 es-GT: Genera la Factura Electronica Automaticamente
1.7 es-GT: Genera la Factura Electronica si no encuentra CAE
1.8 es-GT: Calculos y Conversiones para Factura de Compra
1.9 es-GT: Calculos y Conversiones para Cotizacion de Compra
1.10 es-GT: Calculos y Conversiones para Quotation Item
1.11 es-GT: Calculos y Conversiones para Recibo de Compra
1.12 es-GT: Calculos y Conversiones para Orden de Venta
1.13 es-GT: Calculos y Conversiones para Nota de Entrega
1.14 es-GT: Calculos y Conversiones para Presupuesto de Proveedor

2. Disparadores
2.1 es-GT: Disparadores para Factura de Venta
2.2 es-GT: Disparadores para Productos de Factura de Venta
2.3 es-GT: Disparadores para Factura de Compra
2.4 es-GT: Disparadores para Productos de Factura de Compra
2.5 es-GT: Disparadores para Cotización
2.6 es-GT: Disparadores para Producto de Cotización
2.7 es-GT: Disparadores para Orden de Compra
2.8 es-GT: Disparadores para Productos de Orden de Compra
2.9 es-GT: Disparadores para Recibo de Compra
2.10 es-GT: Disparadores para Productos de Recibo de Compra
2.11 es-GT: Disparadores para Orden de Venta
2.12 es-GT: Disparadores para Productos de Orden de Venta
2.13 es-GT: Disparadores para Nota de Entrega 
2.14 es-GT: Disparadores para Producto de Nota de Entrega
2.15 es-GT: Disparadores para Presupuesto de Proveedor
2.16 es-GT: Disparadores para Producto de Presupuesto de Proveedor
*/


/*
	The route followed ultimately is like this:
1. JavaScript is loaded from the server:
2. Sales invoice form is referenced: frappe.ui.form.on("Sales Invoice", {//TRIGGER CODE GOES HERE!}
3. Triggers are called: onload_post_render: function(frm, cdt, cdn){ //LISTENERS ARE CALLED HERE!},
4. Listeners are activated, for main DocType fields and Child Table Fields:
4.1 Main DocType: cur_frm.fields_dict.[FIELD].$input.on("[EVENT]", function(evt){
			//ACTUAL CODE THAT RUNS GOES HERE
		});
4.2 Child Table DocType: frm.fields_dict.items.grid.wrapper.on('click', 'input[data-fieldname="item_code"][data-doctype="Sales Invoice Item"]', function(e) {
	//ACTUAL CODE THAT RUNS GOES HERE
}
4.3 For both you specify: DocField, Event
4.4 For child table: Also specify the Child Table DocType
5. Two functions are called, in this order:
5.1 each_item(): Goes through each item line and updates the fields, so the next function has correct data.
5.2 facelec_tax_calc_new(): Does the actual calculations.
*/

/*	1 en-US: Functions BEGIN <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<*/
/*	1 es-GT: Funciones EMPIEZAN <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<*/

/*	1.1 en-US: Tax Calculation Conversions BEGIN -------------------------------------*/
/*	1.1 es-GT: Calculos y Conversiones de impuestos EMPIEZA --------------------------*/
// Funcion para los calculos necesarios.
function facelec_tax_calculation_conversion(frm, cdt, cdn) {
    // es-GT: Actualiza los datos en los campos de la tabla hija 'items'
    refresh_field('items');

    // es-GT: Se asigna a la variable el valor que encuentre en la fila 0 de la tabla hija taxes
    this_company_sales_tax_var = cur_frm.doc.taxes[0].rate;

    console.log("If you can see this, tax rate variable now exists, and its set to: " + this_company_sales_tax_var);

    var this_row_qty, this_row_rate, this_row_amount, this_row_conversion_factor, this_row_stock_qty, this_row_tax_rate, this_row_tax_amount, this_row_taxable_amount;

    // es-GT: Esta funcion permite trabajar linea por linea de la tabla hija items
    frm.doc.items.forEach((item_row, index) => {
        if (item_row.name == cdn) {
			// first we calculate the amount total for this row and assign it to a variable
            this_row_amount = (item_row.qty * item_row.rate);
			// Now, we get the quantity in terms of stock quantity by multiplying by conversion factor
			//OLD Method
            //this_row_stock_qty = (item_row.qty * item_row.conversion_factor);
			// NEW Method
			this_row_stock_qty = item_row.stock_qty
			// We then assign the tax rate per stock UOM to a variable
            this_row_tax_rate = (item_row.facelec_tax_rate_per_uom);
			// We calculate the total amount of excise or special tax based on the stock quantity and tax rate per uom variables above.
			//OLD METHOD
            //this_row_tax_amount = (this_row_stock_qty * this_row_tax_rate);
			//NEW Method
			this_row_tax_amount = (item_row.stock_qty * item_row.facelec_tax_rate_per_uom);
			// We then estimate the remainder taxable amount for which Other ERPNext configured taxes will apply.
            this_row_taxable_amount = (this_row_amount - this_row_tax_amount);
			// We change the fields for other tax amount as per the complete row taxable amount.
			// Old version, uncomment in case items do not work properly.
			//frm.doc.items[index].facelec_other_tax_amount = ((item_row.facelec_tax_rate_per_uom * (item_row.qty * item_row.conversion_factor)));
			frm.doc.items[index].facelec_other_tax_amount = this_row_taxable_amount;
			//OJO!  No se puede utilizar stock_qty en los calculos, debe de ser qty a puro tubo!
			// Old version, uncomment in case items do not work properly.
			//frm.doc.items[index].facelec_amount_minus_excise_tax = ((item_row.qty * item_row.rate) - ((item_row.qty * item_row.conversion_factor) * item_row.facelec_tax_rate_per_uom));
			//OLD 2
			//frm.doc.items[index].facelec_amount_minus_excise_tax = this_row_taxable_amount;
			// NEW
			console.log("new calulation")
			frm.refresh_field("items")
			frm.doc.items[index].facelec_amount_minus_excise_tax = ((item_row.qty * item_row.rate) - (item_row.stock_qty * item_row.facelec_tax_rate_per_uom));
            console.log("uom that just changed is: " + item_row.uom);
            console.log("stock qty is: " + item_row.stock_qty); // se queda con el numero anterior.  multiplicar por conversion factor (si existiera!)
            // Por alguna razón esta multiplicando y obteniendo valores negativos  FIXME
			// absoluto? FIXME
			// Que sucedera con una nota de crédito? FIXME
			// Absoluto y luego NEGATIVIZADO!? FIXME
			// Any way to run the function TWICE?
            console.log("conversion_factor is: " + item_row.conversion_factor);

            // Verificacion Individual para verificar si es Fuel, Good o Service
            if (item_row.factelecis_fuel == 1) {
                //console.log("The item you added is FUEL!" + item_row.facelec_is_good);// WORKS OK!
                // Estimamos el valor del IVA para esta linea
                //frm.doc.items[index].facelec_sales_tax_for_this_row = (item_row.facelec_amount_minus_excise_tax * (1 + (this_company_sales_tax_var / 100))).toFixed(2);
                //frm.doc.items[index].facelec_gt_tax_net_fuel_amt = (item_row.facelec_amount_minus_excise_tax - item_row.facelec_sales_tax_for_this_row).toFixed(2);
                frm.doc.items[index].facelec_gt_tax_net_fuel_amt = (item_row.facelec_amount_minus_excise_tax / (1 + (this_company_sales_tax_var / 100)));
                frm.doc.items[index].facelec_sales_tax_for_this_row = (item_row.facelec_gt_tax_net_fuel_amt * (this_company_sales_tax_var / 100));
                // Sumatoria de todos los que tengan el check combustibles
                total_fuel = 0;
                $.each(frm.doc.items || [], function (i, d) {
                    // total_qty += flt(d.qty);
                    if (d.factelecis_fuel == true) {
                        total_fuel += flt(d.facelec_gt_tax_net_fuel_amt);
                    };
                });
                //console.log("El total neto de fuel es:" + total_fuel); // WORKS OK!
                frm.doc.facelec_gt_tax_fuel = total_fuel;
                frm.refresh_field("factelecis_fuel");
            };
            if (item_row.facelec_is_good == 1) {
                //console.log("The item you added is a GOOD!" + item_row.facelec_is_good);// WORKS OK!
                //console.log("El valor en bienes para el libro de compras es: " + net_goods_tally);// WORKS OK!
                // Estimamos el valor del IVA para esta linea
                //frm.doc.items[index].facelec_sales_tax_for_this_row = (item_row.facelec_amount_minus_excise_tax * (this_company_sales_tax_var / 100)).toFixed(2);
                //frm.doc.items[index].facelec_gt_tax_net_goods_amt = (item_row.facelec_amount_minus_excise_tax - item_row.facelec_sales_tax_for_this_row).toFixed(2);
                frm.doc.items[index].facelec_gt_tax_net_goods_amt = (item_row.facelec_amount_minus_excise_tax / (1 + (this_company_sales_tax_var / 100)));
                frm.doc.items[index].facelec_sales_tax_for_this_row = (item_row.facelec_gt_tax_net_goods_amt * (this_company_sales_tax_var / 100));
                // Sumatoria de todos los que tengan el check bienes
                total_goods = 0;
                $.each(frm.doc.items || [], function (i, d) {
                    // total_qty += flt(d.qty);
                    if (d.facelec_is_good == true) {
                        total_goods += flt(d.facelec_gt_tax_net_goods_amt);
                    };
                });
                //console.log("El total neto de bienes es:" + total_goods);// WORKS OK!
                frm.doc.facelec_gt_tax_goods = total_goods;
            };
            if (item_row.facelec_is_service == 1) {
                //console.log("The item you added is a SERVICE!" + item_row.facelec_is_service);// WORKS OK!
                //console.log("El valor en servicios para el libro de compras es: " + net_services_tally);// WORKS OK!
                // Estimamos el valor del IVA para esta linea
                //frm.doc.items[index].facelec_sales_tax_for_this_row = (item_row.facelec_amount_minus_excise_tax * (this_company_sales_tax_var / 100)).toFixed(2);
                //frm.doc.items[index].facelec_gt_tax_net_services_amt = (item_row.facelec_amount_minus_excise_tax - item_row.facelec_sales_tax_for_this_row).toFixed(2);
                frm.doc.items[index].facelec_gt_tax_net_services_amt = (item_row.facelec_amount_minus_excise_tax / (1 + (this_company_sales_tax_var / 100)));
                frm.doc.items[index].facelec_sales_tax_for_this_row = (item_row.facelec_gt_tax_net_services_amt * (this_company_sales_tax_var / 100));

                total_servi = 0;
                $.each(frm.doc.items || [], function (i, d) {
                    if (d.facelec_is_service == true) {
                        total_servi += flt(d.facelec_gt_tax_net_services_amt);
                    };
                });
                // console.log("El total neto de servicios es:" + total_servi); // WORKS OK!
                frm.doc.facelec_gt_tax_services = total_servi;
            };

            // Para el calculo total de IVA, basado en la sumatoria de facelec_sales_tax_for_this_row de cada item
            full_tax_iva = 0;
            $.each(frm.doc.items || [], function (i, d) {
                full_tax_iva += flt(d.facelec_sales_tax_for_this_row);
            });
            frm.doc.facelec_total_iva = full_tax_iva;
        };
    });
}
/*	1.1 en-US: Tax Calculation Conversions END ---------------------------------------*/
/*	1.1 es-GT: Calculos y Conversiones de impuestos TERMINA --------------------------*/

/*	1.1a en-US: Tax Calculation Conversions BEGIN ------------------------------------*/
/*	1.1a es-GT: Calculos y Conversiones de impuestos EMPIEZA -------------------------*/
// Funcion para los calculos necesarios.
function facelec_tax_calc_new(frm, cdt, cdn) {
    // es-GT: Actualiza los datos en los campos de la tabla hija 'items'
	console.log("Running the new tax calc function!");
    // es-GT: Revisamos si ya quedo cargado y definido el rate (tasa) de impuesto en el DocType, el cual debe estar en la fila 0 de Sales Taxes & Charges.
	// es-GT: Si no ha sido definido, no se hace nada. Si ya fue definido, se asigna a una variable el valor que encuentre en la fila 0 de la tabla hija taxes.
	if (typeof(cur_frm.doc.taxes[0].rate) == "undefined" ) {
		//console.log("No se ha cargado impuesto, asi que no se hace nada.");
	} else {
		//console.log("Ahora que ya se especifico un cliente, ya existe impuesto en la hoja, por lo tanto, lo asignamos a una variable!");
		this_company_sales_tax_var = cur_frm.doc.taxes[0].rate;
		console.log("El IVA cargado es: " + this_company_sales_tax_var);
	}
	// es-GT: Ahora se hace con un event listener al primer teclazo del campo de cliente
	// es-GT: Sin embargo queda aqui para asegurar que el valor sea el correcto en todo momento.
    var this_row_qty = 0;
	var this_row_rate = 0;
	var this_row_amount = 0;
	var this_row_conversion_factor = 0;
	var this_row_stock_qty = 0;
	var this_row_tax_rate = 0;
	var this_row_tax_amount =0;
	var this_row_taxable_amount = 0;
	var total_fuel = 0;
	var total_goods = 0;
	var total_servi = 0;

    // es-GT: Esta funcion permite trabajar linea por linea de la tabla hija items
	//OJO! FIXME Queda pendiente trabajar la forma de que el control o pop up que contiene estos datos, a la hora de cambiar conversion factor, funcione adecuadamente sin depender en un mouse click fuera del campo o que se tenga que guardar. Por ahora solo con hacer click afuera del campo o guardar o ingresar a otro campo con la funcion each_item, se actualiza correctamente.  Es un fix temporal, aunque se debe siempre guardar cualquier documento, y al validar tambien se debe correr correctamente!
	frm.doc.items.forEach((item_row, index) => {
		if (item_row.name == cdn) {
			// first we calculate the amount total for this row and assign it to a variable
			//this_row_amount = (item_row.qty * item_row.rate);
			this_row_amount = (item_row.amount);
			// Now, we get the quantity in terms of stock quantity by multiplying by conversion factor
			this_row_stock_qty = item_row.stock_qty
			// We then assign the tax rate per stock UOM to a variable
            this_row_tax_rate = (item_row.facelec_tax_rate_per_uom);
			// We calculate the total amount of excise or special tax based on the stock quantity and tax rate per uom variables above.
			this_row_tax_amount = (item_row.stock_qty * item_row.facelec_tax_rate_per_uom);
			// We then estimate the remainder taxable amount for which Other ERPNext configured taxes will apply.
            this_row_taxable_amount = (item_row.amount - (item_row.stock_qty * item_row.facelec_tax_rate_per_uom));
			// We change the fields for other tax amount as per the complete row taxable amount.
			frm.doc.items[index].facelec_other_tax_amount = ((item_row.facelec_tax_rate_per_uom * (item_row.qty * item_row.conversion_factor)));
			frm.doc.items[index].facelec_amount_minus_excise_tax = ((item_row.qty * item_row.rate) - (item_row.stock_qty * item_row.facelec_tax_rate_per_uom));
            // We refresh the items to recalculate everything to ensure proper math
			frm.refresh_field("items");
			console.log(item_row.qty + " " + item_row.uom + "es/son igual/es a " + item_row.stock_qty + " " + item_row.stock_uom);
			console.log("conversion_factor is: " + item_row.conversion_factor);
			// Probando refrescar el campo de converison factor, talvez asi queda todo nitido??  TODO
			frm.refresh_field("conversion_factor");
			console.log("Other tax amount = Q" + (item_row.stock_qty * item_row.facelec_tax_rate_per_uom));
			console.log("Amount - Other Tax Amount = Amount minus excise tax: " + item_row.amount + " - " + (item_row.stock_qty * item_row.facelec_tax_rate_per_uom) + " = " + item_row.facelec_amount_minus_excise_tax);
			console.log("Q" + item_row.amount + " - (" +  item_row.stock_qty + " * " + item_row.facelec_tax_rate_per_uom + ") ")
			// Verificacion Individual para verificar si es Fuel, Good o Service
			if (item_row.factelecis_fuel == 1) {
				frm.doc.items[index].facelec_gt_tax_net_fuel_amt = (item_row.facelec_amount_minus_excise_tax / (1 + (this_company_sales_tax_var / 100)));
				frm.doc.items[index].facelec_sales_tax_for_this_row = (item_row.facelec_gt_tax_net_fuel_amt * (this_company_sales_tax_var / 100));
				// Sumatoria de todos los que tengan el check combustibles
				total_fuel = 0;
				$.each(frm.doc.items || [], function (i, d) {
					// total_qty += flt(d.qty);
					if (d.factelecis_fuel == true) {
						total_fuel += flt(d.facelec_gt_tax_net_fuel_amt);
					};
				});
				//console.log("El total neto de fuel es:" + total_fuel); // WORKS OK!
				cur_frm.doc.facelec_gt_tax_fuel = total_fuel;
				frm.refresh_field("factelecis_fuel");
			};
			if (item_row.facelec_is_good == 1) {
				frm.doc.items[index].facelec_gt_tax_net_goods_amt = (item_row.facelec_amount_minus_excise_tax / (1 + (this_company_sales_tax_var / 100)));
				frm.doc.items[index].facelec_sales_tax_for_this_row = (item_row.facelec_gt_tax_net_goods_amt * (this_company_sales_tax_var / 100));
				// Sumatoria de todos los que tengan el check bienes
				total_goods = 0;
				$.each(frm.doc.items || [], function (i, d) {
					// total_qty += flt(d.qty);
					if (d.facelec_is_good == true) {
						total_goods += flt(d.facelec_gt_tax_net_goods_amt);
					};
				});
				console.log("El total neto de bienes es:" + total_goods);// WORKS OK!
				cur_frm.doc.facelec_gt_tax_goods = total_goods;
            };
            if (item_row.facelec_is_service == 1) {
                //console.log("The item you added is a SERVICE!" + item_row.facelec_is_service);// WORKS OK!
                //console.log("El valor en servicios para el libro de compras es: " + net_services_tally);// WORKS OK!
                // Estimamos el valor del IVA para esta linea
                //frm.doc.items[index].facelec_sales_tax_for_this_row = (item_row.facelec_amount_minus_excise_tax * (this_company_sales_tax_var / 100)).toFixed(2);
                //frm.doc.items[index].facelec_gt_tax_net_services_amt = (item_row.facelec_amount_minus_excise_tax - item_row.facelec_sales_tax_for_this_row).toFixed(2);
                frm.doc.items[index].facelec_gt_tax_net_services_amt = (item_row.facelec_amount_minus_excise_tax / (1 + (this_company_sales_tax_var / 100)));
                frm.doc.items[index].facelec_sales_tax_for_this_row = (item_row.facelec_gt_tax_net_services_amt * (this_company_sales_tax_var / 100));

                total_servi = 0;
                $.each(frm.doc.items || [], function (i, d) {
                    if (d.facelec_is_service == true) {
                        total_servi += flt(d.facelec_gt_tax_net_services_amt);
						console.log("se detecto cheque de servicio"); // WORKS!
					};
				});
				console.log("El total neto de servicios es:" + total_servi); // WORKS OK!
				cur_frm.doc.facelec_gt_tax_services = total_servi;
			};

            // Para el calculo total de IVA, basado en la sumatoria de facelec_sales_tax_for_this_row de cada item
            full_tax_iva = 0;
            $.each(frm.doc.items || [], function (i, d) {
                full_tax_iva += flt(d.facelec_sales_tax_for_this_row);
            });
			// Seccion Guatemala Tax: Se asigna al campo de IVA de la seccion 
            frm.doc.facelec_total_iva = full_tax_iva;
        };
    });
}
/*	1.1a en-US: Tax Calculation Conversions END --------------------------------------*/
/*	1.1a es-GT: Calculos y Conversiones de impuestos TERMINA -------------------------*/

/*	1.1b en-US: Item refreshing calculations BEGIN ------------------------------------*/
/*	1.1b es-GT: Calculos para refrescar articulos EMPIEZA -------------------------*/
// Esta función refresca los valores de las filas para tener los calculos completos
// Sin necesidad de guardar el formulario.  Esto costo una buenas horas de trabajo!!
// Se lanza con un evento disparado por un escuchador
// FIXME: Lo unico es que solo se puede poner item code con ENTER o CLICK. Tab no funciona.  Quizas aqui si sirve usar un listener de keypress para guardarlo en una variable que lo hace permanecer mientras se escribe el item.
// Esto soluciona el issue #18
function each_item(frm, cdt, cdn){
	// es-GT: Esta permite ya que se calcule correctamente desde el INICIO!
	// es-GT: Sin necesidad de Guardar antes!
	frm.doc.items.forEach((item) => {
		// for each button press each line is being processed.
		console.log("Item, from the each_item function contains: " + item);
		//Importante
		// TODO: Mario, aqui veo que le estas pasando argumentos, es quizás esto lo que me falta?
		tax_before_calc = frm.doc.facelec_total_iva;
		console.log("El descuento total es:" + frm.doc.discount_amount);
		console.log("El IVA calculado anteriormente:" + frm.doc.facelec_total_iva);
		discount_amount_net_value = (frm.doc.discount_amount / (1 + (cur_frm.doc.taxes[0].rate / 100)));
		if (typeof(cur_frm.doc.taxes[0].rate) == "NaN" ) {
			console.log("No hay descuento definido, calculando sin descuento.");
		} else { 
			console.log("El descuento parece ser un numero definido, calculando con descuento.");
			console.log("El neto sin iva del descuento es" + discount_amount_net_value);
			discount_amount_tax_value = (discount_amount_net_value * (cur_frm.doc.taxes[0].rate / 100));
			console.log("El IVA del descuento es:" + discount_amount_tax_value);
			frm.doc.facelec_total_iva = (frm.doc.facelec_total_iva - discount_amount_tax_value);
			console.log("El IVA ya sin el iva del descuento es ahora:" + frm.doc.facelec_total_iva);
		}
		facelec_tax_calc_new(frm, "Sales Invoice Item", item.name);
	});
}
/*	1.1b en-US: Item refreshing calculations END --------------------------------------*/
/*	1.1b es-GT: Calculos para refrescar articulos TERMINA -------------------------*/

/*	1.2 en-US: Search Tax Account BEGIN ----------------------------------------------*/
/*	1.2 es-GT: Busqueda de Cuenta de Impuestos EMPIEZA -------------------------------*/
// Funcion para evitar realizar calculos con cuentas duplicadas
function buscar_account(frm, cuenta_b) {
    /* Funcionamiento: recibe como parametro frm, y cuenta_b, lo que hace es, buscar en todas las filas de taxes
       si existe ya una cuenta con el nombre de la cuenta recibida por parametro, en caso ya exista esa cuenta en
       la tabla no hace nada, pero si encuentra que no hay una cuenta igual a la recibida en el parametro, entonces
       la funcion encargada agregara una nueva fila con los datos correspondientes, esta funcion retorna true
       en caso si encuentre una cuenta existente
    */
    var estado = ''
    $.each(frm.doc.taxes || [], function (i, d) {
        if (d.account_head === cuenta_b) {
            console.log('Si Existe la cuenta de impuestos en el indice ' + i)
            estado = true
        }
    });
    return estado;
}
/*	1.2 en-US: Search Tax Account END ------------------------------------------------*/
/*	1.2 es-GT: Busqueda de Cuenta de Impuestos TERMINA -------------------------------*/

/*	1.3 en-US: Validate Tax ID (NIT) BEGIN -------------------------------------------*/
/*	1.3 es-GT: Validar NIT EMPIEZA ---------------------------------------------------*/
// Funcion para validar el NIT
function valNit(nit, cus_supp, frm) { // cus_supp = customer or supplier
    if (nit === "C/F" || nit === "c/f") {
        frm.enable_save(); // Activa y Muestra el boton guardar de Sales Invoice
    } else {
        var nd, add = 0;
        if (nd = /^(\d+)\-?([\dk])$/i.exec(nit)) {
            nd[2] = (nd[2].toLowerCase() == 'k') ? 10 : parseInt(nd[2]);
            for (var i = 0; i < nd[1].length; i++) {
                add += ((((i - nd[1].length) * -1) + 1) * nd[1][i]);
            }
            nit_validado = ((11 - (add % 11)) % 11) == nd[2];
        } else {
            nit_validado = false;
        }

        if (nit_validado === false) {
            msgprint('NIT de: <b>' + cus_supp + '</b>, no es correcto. Si no tiene disponible el NIT modifiquelo a <b>C/F</b>');
            frm.disable_save(); // Desactiva y Oculta el boton de guardar en Sales Invoice
        }
        if (nit_validado === true) {
            frm.enable_save(); // Activa y Muestra el boton guardar de Sales Invoice
        }
    }
}
/*	1.3 en-US: Validate Tax ID (NIT) END ---------------------------------------------*/
/*	1.3 es-GT: Validar NIT TERMINA ---------------------------------------------------*/

/*	1.4 en-US: Obtain Electronic Invoice PDF BEGIN -----------------------------------*/
/*	1.4 es-GT: Obtener PDF de Factura Electronica EMPIEZA ----------------------------*/
// Funcion para la obtencion del PDF, segun el documento generado.
function pdf_button(cae_documento, frm) {
    // Esta funcion se encarga de mostrar el boton para obtener el pdf de la factura electronica generada
    frm.add_custom_button(__("Obtener PDF"),
        function () {
            window.open("https://www.ingface.net/Ingfacereport/dtefactura.jsp?cae=" + cae_documento);
        }).addClass("btn-primary");
}
/*	1.4 en-US: Obtain Electronic Invoice PDF END -------------------------------------*/
/*	1.4 es-GT: Obtener PDF de Factura Electronica TERMINA ----------------------------*/

/*	1.5 en-US: Generate Electronic Invoice Manually with Button Press BEGIN ----------*/
/*	1.5 es-GT: Genera la Factura Electronica Manualmente presionando el Botón EMPIEZA */
// Funcion que incluye el boton para generar la factura electronica, esta se activa
// cuando en la configuracion de factura electronica se encuentra en MANUAL
function generarFacturaBTN(frm, cdt, cdn) {
    // Codigo para generar Factura Electronica FACE, CFACE
    // El codigo se ejecutara segun el estado del documento, puede ser: Pagado, No Pagado, Validado, Atrasado
    if (frm.doc.status === "Paid" || frm.doc.status === "Unpaid" || frm.doc.status === "Submitted" || frm.doc.status === "Overdue") {
        // SI en el campo de 'cae_factura_electronica' ya se encuentra el dato correspondiente, ocultara el boton
        // para generar el documento, para luego mostrar el boton para obtener el PDF del documento ya generado.
        if (frm.doc.cae_factura_electronica) {
            cur_frm.clear_custom_buttons();
            pdf_button(frm.doc.cae_factura_electronica, frm);
        } else {
            frm.add_custom_button(__('Factura Electronica'), function () {
                // frm.reload(); permite hacer un refresh de todo el documento
                frm.reload_doc();
                frappe.call({
                    method: "factura_electronica.api.generar_factura_electronica",
                    args: {
                        serie_factura: frm.doc.name,
                        nombre_cliente: frm.doc.customer
                    },
                    // El callback recibe como parametro el dato retornado por el script python del lado del servidor
                    callback: function (data) {
                        // Asignacion del valor retornado por el script python del lado del servidor en el campo
                        // 'cae_factura_electronica' para ser mostrado del lado del cliente y luego guardado en la DB
                        cur_frm.set_value("cae_factura_electronica", data.message);
                        frm.save("Update");
                        if (frm.doc.cae_factura_electronica) {
                            cur_frm.clear_custom_buttons();
                            pdf_button(frm.doc.cae_factura_electronica, frm);
                        }
                    }
                });
            }).addClass("btn-primary");
        }
    }
    // Codigo para Notas de Credito NCE
    // El codigo se ejecutara segun el estado del documento, puede ser: Retornar
    if (frm.doc.status === "Return") {
        //var nombre = 'Nota Credito';
        // SI en el campo de 'cae_nota_de_credito' ya se encuentra el dato correspondiente, ocultara el boton
        // para generar el documento, para luego mostrar el boton para obtener el PDF del documento ya generado.
        if (frm.doc.cae_nota_de_credito) {
            cur_frm.clear_custom_buttons();
            pdf_button(frm.doc.cae_nota_de_credito, frm);
        } else {
            frm.add_custom_button(__('Nota Credito'), function () {
                // frm.reload(); permite hacer un refresh de todo el documento
                frm.reload_doc();
                frappe.call({
                    method: "factura_electronica.api.generar_factura_electronica",
                    args: {
                        serie_factura: frm.doc.name,
                        nombre_cliente: frm.doc.customer
                    },
                    // El callback recibe como parametro el dato retornado por script python del lado del servidor
                    callback: function (data) {
                        // Asignacion del valor retornado por el script python del lado del servidor en el campo
                        // 'cae_nota_de_credito' para ser mostrado del lado del cliente y luego guardado en la DB
                        cur_frm.set_value("cae_nota_de_credito", data.message);
                        frm.save("Update");
                        if (frm.doc.cae_nota_de_credito) {
                            cur_frm.clear_custom_buttons();
                            pdf_button(frm.doc.cae_nota_de_credito, frm);
                        }
                    }
                });
            }).addClass("btn-primary");
        }
    }

    // Codigo para notas de debito
    // Codigo para Notas de Credito NDE
    if (frm.doc.status === "Paid" || frm.doc.status === "Unpaid" || frm.doc.status === "Submitted" || frm.doc.status === "Overdue") {

        //var nombre = 'Nota Debito';
        if (frm.doc.es_nota_de_debito == 1) {
            cur_frm.clear_custom_buttons('Factura Electronica');
            if (frm.doc.cae_nota_de_debito) {
                cur_frm.clear_custom_buttons();
                pdf_button(frm.doc.cae_nota_de_debito, frm);
            } else {
                frm.add_custom_button(__('Nota Debito'), function () {
                    // frm.reload(); permite hacer un refresh de todo el documento
                    frm.reload_doc();
                    frappe.call({
                        method: "factura_electronica.api.generar_factura_electronica",
                        args: {
                            serie_factura: frm.doc.name,
                            nombre_cliente: frm.doc.customer
                        },
                        // El callback recibe como parametro el dato retornado por script python del lado del servidor
                        callback: function (data) {
                            cur_frm.set_value("cae_nota_de_debito", data.message);
                            frm.save("Update");
                            if (frm.doc.cae_nota_de_debito) {
                                cur_frm.clear_custom_buttons();
                                pdf_button(frm.doc.cae_nota_de_debito, frm);
                            }
                        }
                    });
                }).addClass("btn-primary");
            }
        }
    }
}
/*	1.5 en-US: Generate Electronic Invoice Manually with Button Press END ------------*/
/*	1.5 es-GT: Genera la Factura Electronica Manualmente presionando el Botón TERMINA */

/*	1.6 en-US: Generate Electronic Invoice Automatically BEGIN -----------------------*/
/*	1.6 es-GT: Genera la Factura Electronica Automaticamente EMPIEZA -----------------*/
// Funcion sin boton para generar factura electronica, esta se activa cuando la configuracion de factura
// electronica se encuentra en AUTOMATICA. Permite generar facturas electronicas despues de validar.
function generarFacturaSINBTN(frm, cdt, cdn) {
    // Codigo para generar Factura Electronica FACE, CFACE
    // El codigo se ejecutara segun el estado del documento, puede ser: Pagado, No Pagado, Validado, Atrasado
    if (frm.doc.status === "Paid" || frm.doc.status === "Unpaid" || frm.doc.status === "Submitted" || frm.doc.status === "Overdue") {
        // SI en el campo de 'cae_factura_electronica' ya se encuentra el dato correspondiente, ocultara el boton
        // para generar el documento, para luego mostrar el boton para obtener el PDF del documento ya generado.
        if (frm.doc.cae_factura_electronica) {
            cur_frm.clear_custom_buttons();
            pdf_button(frm.doc.cae_factura_electronica, frm);
        } else {
            // frm.reload(); permite hacer un refresh de todo el documento
            frm.reload_doc();
            frappe.call({
                method: "factura_electronica.api.generar_factura_electronica",
                args: {
                    serie_factura: frm.doc.name,
                    nombre_cliente: frm.doc.customer
                },
                // El callback recibe como parametro el dato retornado por script python del lado del servidor
                callback: function (data) {
                    // Asignacion del valor retornado por el script python del lado del servidor en el campo
                    // 'cae_factura_electronica' para ser mostrado del lado del cliente y luego guardado en la DB
                    cur_frm.set_value("cae_factura_electronica", data.message);
                    frm.save("Update");
                    if (frm.doc.cae_factura_electronica) {
                        cur_frm.clear_custom_buttons();
                        pdf_button(frm.doc.cae_factura_electronica, frm);
                    }
                }
            });
        }
    }
    // Codigo para Notas de Credito NCE
    // El codigo se ejecutara segun el estado del documento, puede ser: Retornar
    if (frm.doc.status === "Return") {
        //var nombre = 'Nota Credito';
        // SI en el campo de 'cae_nota_de_credito' ya se encuentra el dato correspondiente, ocultara el boton
        // para generar el documento, para luego mostrar el boton para obtener el PDF del documento ya generado.
        if (frm.doc.cae_nota_de_credito) {
            cur_frm.clear_custom_buttons();
            pdf_button(frm.doc.cae_nota_de_credito, frm);
        } else {
            // frm.reload(); permite hacer un refresh de todo el documento
            frm.reload_doc();
            frappe.call({
                method: "factura_electronica.api.generar_factura_electronica",
                args: {
                    serie_factura: frm.doc.name,
                    nombre_cliente: frm.doc.customer
                },
                // El callback recibe como parametro el dato retornado por script python del lado del servidor
                callback: function (data) {
                    // Asignacion del valor retornado por el script python del lado del servidor en el campo
                    // 'cae_nota_de_credito' para ser mostrado del lado del cliente y luego guardado en la DB
                    cur_frm.set_value("cae_nota_de_credito", data.message);
                    frm.save("Update");
                    if (frm.doc.cae_nota_de_credito) {
                        cur_frm.clear_custom_buttons();
                        pdf_button(frm.doc.cae_nota_de_credito, frm);
                    }
                }
            });
        }
    }

    // Codigo para notas de debito
    // Codigo para Notas de Credito NDE
    if (frm.doc.status === "Paid" || frm.doc.status === "Unpaid" || frm.doc.status === "Submitted" || frm.doc.status === "Overdue") {
        //var nombre = 'Nota Debito';
        if (frm.doc.es_nota_de_debito == 1) {
            cur_frm.clear_custom_buttons('Factura Electronica');
            if (frm.doc.cae_nota_de_debito) {
                cur_frm.clear_custom_buttons();
                pdf_button(frm.doc.cae_nota_de_debito, frm);
            } else {
                // frm.reload(); permite hacer un refresh de todo el documento
                frm.reload_doc();
                frappe.call({
                    method: "factura_electronica.api.generar_factura_electronica",
                    args: {
                        serie_factura: frm.doc.name,
                        nombre_cliente: frm.doc.customer
                    },
                    // El callback recibe como parametro el dato retornado por script python del lado del servidor
                    callback: function (data) {
                        cur_frm.set_value("cae_nota_de_debito", data.message);
                        frm.save("Update");
                        if (frm.doc.cae_nota_de_debito) {
                            cur_frm.clear_custom_buttons();
                            pdf_button(frm.doc.cae_nota_de_debito, frm);
                        }
                    }
                });
            }
        }
    }
}
/*	1.6 en-US: Generate Electronic Invoice Automatically END -------------------------*/
/*	1.6 es-GT: Genera la Factura Electronica Automaticamente TERMINA -----------------*/

/*	1.7 en-US: Generate Electronic Invoice if CAE not present BEGIN ------------------*/
/*	1.7 es-GT: Genera la Factura Electronica si no encuentra CAE EMPIEZA -------------*/
// Funcion verifica que se haya generado el CAE, para el documento requerido, en caso no se haya
// generado mostrara un boton para hacerlo manualmente.
function verificacionCAE(frm, cdt, cdn) {
    /* ------------------------------ COMPROBACIONES DE CAE ------------------------------ */
    // FACTURAS FACE, CFACE
    // Este codigo entra en funcionamiento cuando la generacion automatica de la factura no es exitosa.
    // esto permite volver intentarlo hasta obtener el cae de la factura en que se estre trabajando.
    if (frm.doc.status === "Paid" || frm.doc.status === "Unpaid" || frm.doc.status === "Submitted" || frm.doc.status === "Overdue") {
        // SI en el campo de 'cae_factura_electronica' ya se encuentra el dato correspondiente, ocultara el boton
        // para generar el documento, para luego mostrar el boton para obtener el PDF del documento ya generado.
        if (frm.doc.cae_factura_electronica) {
            cur_frm.clear_custom_buttons();
            pdf_button(frm.doc.cae_factura_electronica, frm);
        } else {
            generarFacturaBTN(frm, cdt, cdn);
        }
    }

    // Codigo para Notas de Credito NCE
    // El codigo se ejecutara segun el estado del documento, puede ser: Retornar
    if (frm.doc.status === "Return") {
        //var nombre = 'Nota Credito';
        // SI en el campo de 'cae_nota_de_credito' ya se encuentra el dato correspondiente, ocultara el boton
        // para generar el documento, para luego mostrar el boton para obtener el PDF del documento ya generado.
        if (frm.doc.cae_nota_de_credito) {
            cur_frm.clear_custom_buttons();
            pdf_button(frm.doc.cae_nota_de_credito, frm);
        } else {
            generarFacturaBTN(frm, cdt, cdn);
        }
    }

    // Codigo para notas de debito
    // Codigo para Notas de Credito NDE
    if (frm.doc.status === "Paid" || frm.doc.status === "Unpaid" || frm.doc.status === "Submitted" || frm.doc.status === "Overdue") {
        //var nombre = 'Nota Debito';
        if (frm.doc.es_nota_de_debito) {
            cur_frm.clear_custom_buttons('Factura Electronica');
            if (frm.doc.cae_nota_de_debito) {
                cur_frm.clear_custom_buttons();
                pdf_button(frm.doc.cae_nota_de_debito, frm);
            } else {
                generarFacturaBTN(frm, cdt, cdn);
            }
        }
    }
}
/*	1.7 en-US: Generate Electronic Invoice if CAE not present END --------------------*/
/*	1.7 es-GT: Genera la Factura Electronica si no encuentra CAE TERMINA -------------*/

/*	1.8 en-US: Tax Calculation Conversions for Purchase Invoice BEGIN ----------------*/
/*	1.8 es-GT: Calculos y Conversiones para Factura de Compra EMPIEZA ----------------*/
// Codigo Adaptado para Purchase Invoice (Factura de Compra) 
// Funcion para calculo de impuestos
function shs_purchase_invoice_calculation(frm, cdt, cdn) {

    refresh_field('items');

    this_company_sales_tax_var = cur_frm.doc.taxes[0].rate;

    var this_row_qty, this_row_rate, this_row_amount, this_row_conversion_factor, this_row_stock_qty, this_row_tax_rate, this_row_tax_amount, this_row_taxable_amount;

    frm.doc.items.forEach((item_row, index) => {
        if (item_row.name == cdn) {
            this_row_amount = (item_row.qty * item_row.rate);
            this_row_stock_qty = (item_row.qty * item_row.conversion_factor);
            this_row_tax_rate = (item_row.facelec_p_tax_rate_per_uom);
            this_row_tax_amount = (this_row_stock_qty * this_row_tax_rate);
            this_row_taxable_amount = (this_row_amount - this_row_tax_amount);
            // Convert a number into a string, keeping only two decimals:
            frm.doc.items[index].facelec_p_other_tax_amount = ((item_row.facelec_p_tax_rate_per_uom * (item_row.qty * item_row.conversion_factor)));
            //OJO!  No s epuede utilizar stock_qty en los calculos, debe de ser qty a puro tubo!
            frm.doc.items[index].facelec_p_amount_minus_excise_tax = ((item_row.qty * item_row.rate) - ((item_row.qty * item_row.conversion_factor) * item_row.facelec_p_tax_rate_per_uom));
            console.log("uom that just changed is: " + item_row.uom);
            console.log("stock qty is: " + item_row.stock_qty); // se queda con el numero anterior.  multiplicar por conversion factor (si existiera!)
            // Por alguna razón esta multiplicando y obteniendo valores negativos  FIXME
			// absoluto? FIXME
			// Que sucedera con una nota de crédito? FIXME
			// Absoluto y luego NEGATIVIZADO!? FIXME
            console.log("conversion_factor is: " + item_row.conversion_factor);
            if (item_row.facelec_p_is_fuel == 1) {
                frm.doc.items[index].facelec_p_gt_tax_net_fuel_amt = (item_row.facelec_p_amount_minus_excise_tax / (1 + (this_company_sales_tax_var / 100)));
                frm.doc.items[index].facelec_p_sales_tax_for_this_row = (item_row.facelec_p_gt_tax_net_fuel_amt * (this_company_sales_tax_var / 100));
                // Sumatoria de todos los que tengan el check combustibles
                total_fuel = 0;
                $.each(frm.doc.items || [], function (i, d) {
                    // total_qty += flt(d.qty);
                    if (d.facelec_p_is_fuel == true) {
                        total_fuel += flt(d.facelec_p_gt_tax_net_fuel_amt);
                    };
                });
                frm.doc.facelec_p_gt_tax_fuel = total_fuel;
                //frm.refresh_field("factelec_p_is_fuel");
            };
            if (item_row.facelec_p_is_good == 1) {
                frm.doc.items[index].facelec_p_gt_tax_net_goods_amt = (item_row.facelec_p_amount_minus_excise_tax / (1 + (this_company_sales_tax_var / 100)));
                frm.doc.items[index].facelec_p_sales_tax_for_this_row = (item_row.facelec_p_gt_tax_net_goods_amt * (this_company_sales_tax_var / 100));
                // Sumatoria de todos los que tengan el check bienes
                total_goods = 0;
                $.each(frm.doc.items || [], function (i, d) {
                    if (d.facelec_p_is_good == true) {
                        total_goods += flt(d.facelec_p_gt_tax_net_goods_amt);
                    };
                });
                frm.doc.facelec_p_gt_tax_goods = total_goods;
            };
            if (item_row.facelec_p_is_service == 1) {
                frm.doc.items[index].facelec_p_gt_tax_net_services_amt = (item_row.facelec_p_amount_minus_excise_tax / (1 + (this_company_sales_tax_var / 100)));
                frm.doc.items[index].facelec_p_sales_tax_for_this_row = (item_row.facelec_p_gt_tax_net_services_amt * (this_company_sales_tax_var / 100));
                // Sumatoria de todos los que tengan el check servicios
                total_servi = 0;
                $.each(frm.doc.items || [], function (i, d) {
                    if (d.facelec_p_is_service == true) {
                        total_servi += flt(d.facelec_p_gt_tax_net_services_amt);
                    };
                });
                frm.doc.facelec_p_gt_tax_services = total_servi;
            };
            full_tax_iva = 0;
            $.each(frm.doc.items || [], function (i, d) {
                full_tax_iva += flt(d.facelec_p_sales_tax_for_this_row);
            });
            frm.doc.facelec_p_total_iva = full_tax_iva;
        };
    });
}
/*	1.8 en-US: Tax Calculation Conversions for Purchase Invoice END ------------------*/
/*	1.8 es-GT: Calculos y Conversiones para Factura de Compra TERMINA ----------------*/

/*	1.9 en-US: Tax Calculation Conversions for Cotizacion de Compra BEGIN ------------*/
/*	1.9 es-GT: Calculos y Conversiones para Cotizacion de Compra EMPIEZA -------------*/
// Codigo Adaptado para Purchase Quotation (Cotizacion de compra)
// Funcion para calculo de impuestos
function shs_quotation_calculation(frm, cdt, cdn) {

    refresh_field('items');

    this_company_sales_tax_var = cur_frm.doc.taxes[0].rate;

    var this_row_qty, this_row_rate, this_row_amount, this_row_conversion_factor, this_row_stock_qty, this_row_tax_rate, this_row_tax_amount, this_row_taxable_amount;

    frm.doc.items.forEach((item_row, index) => {
        if (item_row.name == cdn) {
            this_row_amount = (item_row.qty * item_row.rate);
            this_row_stock_qty = (item_row.qty * item_row.conversion_factor);
            this_row_tax_rate = (item_row.facelec_qt_tax_rate_per_uom);
            this_row_tax_amount = (this_row_stock_qty * this_row_tax_rate);
            this_row_taxable_amount = (this_row_amount - this_row_tax_amount);
            // Convert a number into a string, keeping only two decimals:
            frm.doc.items[index].facelec_qt_other_tax_amount = ((item_row.facelec_qt_tax_rate_per_uom * (item_row.qty * item_row.conversion_factor)));
            //OJO!  No s epuede utilizar stock_qty en los calculos, debe de ser qty a puro tubo!
            frm.doc.items[index].facelec_qt_amount_minus_excise_tax = ((item_row.qty * item_row.rate) - ((item_row.qty * item_row.conversion_factor) * item_row.facelec_qt_tax_rate_per_uom));
            console.log("uom that just changed is: " + item_row.uom);
            console.log("stock qty is: " + item_row.stock_qty); // se queda con el numero anterior.  multiplicar por conversion factor (si existiera!)
            // Por alguna razón esta multiplicando y obteniendo valores negativos  FIXME
			// absoluto? FIXME
			// Que sucedera con una nota de crédito? FIXME
			// Absoluto y luego NEGATIVIZADO!? FIXME
            console.log("conversion_factor is: " + item_row.conversion_factor);
            if (item_row.facelec_qt_is_fuel == 1) {
                frm.doc.items[index].facelec_qt_gt_tax_net_fuel_amt = (item_row.facelec_qt_amount_minus_excise_tax / (1 + (this_company_sales_tax_var / 100)));
                frm.doc.items[index].facelec_qt_sales_tax_for_this_row = (item_row.facelec_qt_gt_tax_net_fuel_amt * (this_company_sales_tax_var / 100));
                // Sumatoria de todos los que tengan el check combustibles
                total_fuel = 0;
                $.each(frm.doc.items || [], function (i, d) {
                    // total_qty += flt(d.qty);
                    if (d.facelec_qt_is_fuel == true) {
                        total_fuel += flt(d.facelec_qt_gt_tax_net_fuel_amt);
                    };
                });
                frm.doc.facelec_qt_gt_tax_fuel = total_fuel;
                //frm.refresh_field("factelec_p_is_fuel");
            };
            if (item_row.facelec_qt_is_good == 1) {
                frm.doc.items[index].facelec_qt_gt_tax_net_goods_amt = (item_row.facelec_qt_amount_minus_excise_tax / (1 + (this_company_sales_tax_var / 100)));
                frm.doc.items[index].facelec_qt_sales_tax_for_this_row = (item_row.facelec_qt_gt_tax_net_goods_amt * (this_company_sales_tax_var / 100));
                // Sumatoria de todos los que tengan el check bienes
                total_goods = 0;
                $.each(frm.doc.items || [], function (i, d) {
                    if (d.facelec_qt_is_good == true) {
                        total_goods += flt(d.facelec_qt_gt_tax_net_goods_amt);
                    };
                });
                frm.doc.facelec_qt_gt_tax_goods = total_goods;
            };
            if (item_row.facelec_qt_is_service == 1) {
                frm.doc.items[index].facelec_qt_gt_tax_net_services_amt = (item_row.facelec_qt_amount_minus_excise_tax / (1 + (this_company_sales_tax_var / 100)));
                frm.doc.items[index].facelec_qt_sales_tax_for_this_row = (item_row.facelec_qt_gt_tax_net_services_amt * (this_company_sales_tax_var / 100));
                // Sumatoria de todos los que tengan el check servicios
                total_servi = 0;
                $.each(frm.doc.items || [], function (i, d) {
                    if (d.facelec_qt_is_service == true) {
                        total_servi += flt(d.facelec_qt_gt_tax_net_services_amt);
                    };
                });
                frm.doc.facelec_qt_gt_tax_services = total_servi;
            };
            full_tax_iva = 0;
            $.each(frm.doc.items || [], function (i, d) {
                full_tax_iva += flt(d.facelec_qt_sales_tax_for_this_row);
            });
            frm.doc.facelec_qt_total_iva = full_tax_iva;
        };
    });
}
/*	1.9 en-US: Tax Calculation Conversions for Cotizacion de Compra END --------------*/
/*	1.9 es-GT: Calculos y Conversiones para Cotizacion de Compra TERMINA -------------*/

/*	1.10 en-US: Tax Calculation Conversions for Quotation Item BEGIN -----------------*/
/*	1.10 es-GT: Calculos y Conversiones para Quotation Item EMPIEZA ------------------*/
// Codigo Adaptado para Purchase Order (Orden de compra)
// Funcion para calculo de impuestos
function shs_purchase_order_calculation(frm, cdt, cdn) {
    // es-GT: Actualiza los campos de la tabla hija 'items'
    refresh_field('items');
    // es-GT: Asigna a la variable el valor rate de la tabla hija 'taxes' en la posicion 0
    this_company_sales_tax_var = cur_frm.doc.taxes[0].rate;

    var this_row_qty, this_row_rate, this_row_amount, this_row_conversion_factor, this_row_stock_qty, this_row_tax_rate, this_row_tax_amount, this_row_taxable_amount;
    // es-GT: Funcion que permite realizar los calculos necesarios dependiendo de la linea en la que se este trabajando
    frm.doc.items.forEach((item_row, index) => {
        if (item_row.name == cdn) {
            this_row_amount = (item_row.qty * item_row.rate);
            this_row_stock_qty = (item_row.qty * item_row.conversion_factor);
            this_row_tax_rate = (item_row.facelec_po_tax_rate_per_uom);
            this_row_tax_amount = (this_row_stock_qty * this_row_tax_rate);
            this_row_taxable_amount = (this_row_amount - this_row_tax_amount);
            // Convert a number into a string, keeping only two decimals:
            frm.doc.items[index].facelec_po_other_tax_amount = ((item_row.facelec_po_tax_rate_per_uom * (item_row.qty * item_row.conversion_factor)));
            //OJO!  No s epuede utilizar stock_qty en los calculos, debe de ser qty a puro tubo!
            frm.doc.items[index].facelec_po_amount_minus_excise_tax = ((item_row.qty * item_row.rate) - ((item_row.qty * item_row.conversion_factor) * item_row.facelec_po_tax_rate_per_uom));
            console.log("uom that just changed is: " + item_row.uom);
            console.log("stock qty is: " + item_row.stock_qty); // se queda con el numero anterior.  multiplicar por conversion factor (si existiera!)
            // Por alguna razón esta multiplicando y obteniendo valores negativos  FIXME
			// absoluto? FIXME
			// Que sucedera con una nota de crédito? FIXME
			// Absoluto y luego NEGATIVIZADO!? FIXME
            console.log("conversion_factor is: " + item_row.conversion_factor);
            // es-GT: Verificacion de si esta seleccionado el check Combustible
            if (item_row.facelec_po_is_fuel == 1) {
                frm.doc.items[index].facelec_po_gt_tax_net_fuel_amt = (item_row.facelec_po_amount_minus_excise_tax / (1 + (this_company_sales_tax_var / 100)));
                frm.doc.items[index].facelec_po_sales_tax_for_this_row = (item_row.facelec_po_gt_tax_net_fuel_amt * (this_company_sales_tax_var / 100));
                // Sumatoria de todos los que tengan el check combustibles
                total_fuel = 0;
                $.each(frm.doc.items || [], function (i, d) {
                    // total_qty += flt(d.qty);
                    if (d.facelec_po_is_fuel == true) {
                        total_fuel += flt(d.facelec_po_gt_tax_net_fuel_amt);
                    };
                });
                frm.doc.facelec_po_gt_tax_fuel = total_fuel;
                //frm.refresh_field("factelec_p_is_fuel");
            };
            // es-GT: Verificacion de si esta seleccionado el check Bienes
            if (item_row.facelec_po_is_good == 1) {
                frm.doc.items[index].facelec_po_gt_tax_net_goods_amt = (item_row.facelec_po_amount_minus_excise_tax / (1 + (this_company_sales_tax_var / 100)));
                frm.doc.items[index].facelec_po_sales_tax_for_this_row = (item_row.facelec_po_gt_tax_net_goods_amt * (this_company_sales_tax_var / 100));
                // Sumatoria de todos los que tengan el check bienes
                total_goods = 0;
                $.each(frm.doc.items || [], function (i, d) {
                    if (d.facelec_po_is_good == true) {
                        total_goods += flt(d.facelec_po_gt_tax_net_goods_amt);
                    };
                });
                frm.doc.facelec_po_gt_tax_goods = total_goods;
            };
            // es-GT: Verificacion de si esta seleccionado el check Servicios
            if (item_row.facelec_po_is_service == 1) {
                frm.doc.items[index].facelec_po_gt_tax_net_services_amt = (item_row.facelec_po_amount_minus_excise_tax / (1 + (this_company_sales_tax_var / 100)));
                frm.doc.items[index].facelec_po_sales_tax_for_this_row = (item_row.facelec_po_gt_tax_net_services_amt * (this_company_sales_tax_var / 100));
                // Sumatoria de todos los que tengan el check servicios
                total_servi = 0;
                $.each(frm.doc.items || [], function (i, d) {
                    if (d.facelec_po_is_service == true) {
                        total_servi += flt(d.facelec_po_gt_tax_net_services_amt);
                    };
                });
                frm.doc.facelec_po_gt_tax_services = total_servi;
            };
            // es-GT: Sumatoria para obtener el IVA total
            full_tax_iva = 0;
            $.each(frm.doc.items || [], function (i, d) {
                full_tax_iva += flt(d.facelec_po_sales_tax_for_this_row);
            });
            frm.doc.facelec_po_total_iva = full_tax_iva;
        };
    });
}
/*	1.10 en-US: Tax Calculation Conversions for Cotizacion de Compra END -------------*/
/*	1.10 es-GT: Calculos y Conversiones para Cotizacion de Compra TERMINA ------------*/

/*	1.11 en-US: Tax Calculation Conversions for Purchase Receipt BEGIN ---------------*/
/*	1.11 es-GT: Calculos y Conversiones para Recibo de Compra EMPIEZA ----------------*/
// Codigo Adaptado para Purchase Receipt (Recibo de Compra) 
// Funcion para calculo de impuestos
function shs_purchase_receipt_calculation(frm, cdt, cdn) {

    refresh_field('items');

    this_company_sales_tax_var = cur_frm.doc.taxes[0].rate;

    var this_row_qty, this_row_rate, this_row_amount, this_row_conversion_factor, this_row_stock_qty, this_row_tax_rate, this_row_tax_amount, this_row_taxable_amount;

    frm.doc.items.forEach((item_row, index) => {
        if (item_row.name == cdn) {
            this_row_amount = (item_row.qty * item_row.rate);
            this_row_stock_qty = (item_row.qty * item_row.conversion_factor);
            this_row_tax_rate = (item_row.facelec_pr_tax_rate_per_uom);
            this_row_tax_amount = (this_row_stock_qty * this_row_tax_rate);
            this_row_taxable_amount = (this_row_amount - this_row_tax_amount);
            // Convert a number into a string, keeping only two decimals:
            frm.doc.items[index].facelec_pr_other_tax_amount = ((item_row.facelec_pr_tax_rate_per_uom * (item_row.qty * item_row.conversion_factor)));
            //OJO!  No s epuede utilizar stock_qty en los calculos, debe de ser qty a puro tubo!
            frm.doc.items[index].facelec_pr_amount_minus_excise_tax = ((item_row.qty * item_row.rate) - ((item_row.qty * item_row.conversion_factor) * item_row.facelec_pr_tax_rate_per_uom));
            console.log("uom that just changed is: " + item_row.uom);
            console.log("stock qty is: " + item_row.stock_qty); // se queda con el numero anterior.  multiplicar por conversion factor (si existiera!)
            // Por alguna razón esta multiplicando y obteniendo valores negativos  FIXME
			// absoluto? FIXME
			// Que sucedera con una nota de crédito? FIXME
			// Absoluto y luego NEGATIVIZADO!? FIXME
            console.log("conversion_factor is: " + item_row.conversion_factor);
            if (item_row.facelec_pr_is_fuel == 1) {
                frm.doc.items[index].facelec_pr_gt_tax_net_fuel_amt = (item_row.facelec_pr_amount_minus_excise_tax / (1 + (this_company_sales_tax_var / 100)));
                frm.doc.items[index].facelec_pr_sales_tax_for_this_row = (item_row.facelec_pr_gt_tax_net_fuel_amt * (this_company_sales_tax_var / 100));
                // Sumatoria de todos los que tengan el check combustibles
                total_fuel = 0;
                $.each(frm.doc.items || [], function (i, d) {
                    // total_qty += flt(d.qty);
                    if (d.facelec_pr_is_fuel == true) {
                        total_fuel += flt(d.facelec_pr_gt_tax_net_fuel_amt);
                    };
                });
                frm.doc.facelec_pr_gt_tax_fuel = total_fuel;
                //frm.refresh_field("factelec_p_is_fuel");
            };
            if (item_row.facelec_pr_is_good == 1) {
                frm.doc.items[index].facelec_pr_gt_tax_net_goods_amt = (item_row.facelec_pr_amount_minus_excise_tax / (1 + (this_company_sales_tax_var / 100)));
                frm.doc.items[index].facelec_pr_sales_tax_for_this_row = (item_row.facelec_pr_gt_tax_net_goods_amt * (this_company_sales_tax_var / 100));
                // Sumatoria de todos los que tengan el check bienes
                total_goods = 0;
                $.each(frm.doc.items || [], function (i, d) {
                    if (d.facelec_pr_is_good == true) {
                        total_goods += flt(d.facelec_pr_gt_tax_net_goods_amt);
                    };
                });
                frm.doc.facelec_pr_gt_tax_goods = total_goods;
            };
            if (item_row.facelec_pr_is_service == 1) {
                frm.doc.items[index].facelec_pr_gt_tax_net_services_amt = (item_row.facelec_pr_amount_minus_excise_tax / (1 + (this_company_sales_tax_var / 100)));
                frm.doc.items[index].facelec_pr_sales_tax_for_this_row = (item_row.facelec_pr_gt_tax_net_services_amt * (this_company_sales_tax_var / 100));
                // Sumatoria de todos los que tengan el check servicios
                total_servi = 0;
                $.each(frm.doc.items || [], function (i, d) {
                    if (d.facelec_pr_is_service == true) {
                        total_servi += flt(d.facelec_pr_gt_tax_net_services_amt);
                    };
                });
                frm.doc.facelec_pr_gt_tax_services = total_servi;
            };
            full_tax_iva = 0;
            $.each(frm.doc.items || [], function (i, d) {
                full_tax_iva += flt(d.facelec_pr_sales_tax_for_this_row);
            });
            frm.doc.facelec_pr_total_iva = full_tax_iva;
        };
    });
}
/*	1.11 en-US: Tax Calculation Conversions for Purchase Receipt END -----------------*/
/*	1.11 es-GT: Calculos y Conversiones para Recibo de Compra TERMINA ----------------*/

/*	1.12 en-US: Tax Calculation Conversions for Sales Order BEGIN --------------------*/
/*	1.12 es-GT: Calculos y Conversiones para Orden de Venta EMPIEZA ------------------*/
// Codigo Adaptado para Sales Order (Orden de Venta) 
// Funcion para calculo de impuestos
function shs_sales_order_calculation(frm, cdt, cdn) {

    refresh_field('items');

    let this_company_sales_tax_var = cur_frm.doc.taxes[0].rate;

    let this_row_qty, this_row_rate, this_row_amount, this_row_conversion_factor, this_row_stock_qty, this_row_tax_rate, this_row_tax_amount, this_row_taxable_amount;

    frm.doc.items.forEach((item_row, index) => {
        if (item_row.name === cdn) {
            this_row_amount = (item_row.qty * item_row.rate);
            this_row_stock_qty = (item_row.qty * item_row.conversion_factor);
            this_row_tax_rate = (item_row.shs_so_tax_rate_per_uom);
            this_row_tax_amount = (this_row_stock_qty * this_row_tax_rate);
            this_row_taxable_amount = (this_row_amount - this_row_tax_amount);
            // Convert a number into a string, keeping only two decimals:
            frm.doc.items[index].shs_so_other_tax_amount = ((item_row.shs_so_tax_rate_per_uom * (item_row.qty * item_row.conversion_factor)));
            //OJO!  No s epuede utilizar stock_qty en los calculos, debe de ser qty a puro tubo!
            frm.doc.items[index].shs_so_amount_minus_excise_tax = ((item_row.qty * item_row.rate) - ((item_row.qty * item_row.conversion_factor) * item_row.shs_so_tax_rate_per_uom));
            console.log("uom that just changed is: " + item_row.uom);
            console.log("stock qty is: " + item_row.stock_qty); // se queda con el numero anterior.  multiplicar por conversion factor (si existiera!)
            // Por alguna razón esta multiplicando y obteniendo valores negativos  FIXME
			// absoluto? FIXME
			// Que sucedera con una nota de crédito? FIXME
			// Absoluto y luego NEGATIVIZADO!? FIXME
            console.log("conversion_factor is: " + item_row.conversion_factor);
            if (item_row.shs_so_is_fuel === 1) {
                frm.doc.items[index].shs_so_gt_tax_net_fuel_amt = (item_row.shs_so_amount_minus_excise_tax / (1 + (this_company_sales_tax_var / 100)));
                frm.doc.items[index].shs_so_sales_tax_for_this_row = (item_row.shs_so_gt_tax_net_fuel_amt * (this_company_sales_tax_var / 100));
                // Sumatoria de todos los que tengan el check combustibles
                let total_fuel = 0;
                $.each(frm.doc.items || [], function (i, d) {
                    // total_qty += flt(d.qty);
                    if (d.shs_so_is_fuel === 1) {
                        total_fuel += flt(d.shs_so_gt_tax_net_fuel_amt);
                    };
                });
                frm.doc.shs_gt_tax_fuel = total_fuel;
                //frm.refresh_field("factelec_p_is_fuel");
            };
            if (item_row.shs_so_is_good === 1) {
                frm.doc.items[index].shs_so_gt_tax_net_goods_amt = (item_row.shs_so_amount_minus_excise_tax / (1 + (this_company_sales_tax_var / 100)));
                frm.doc.items[index].shs_so_sales_tax_for_this_row = (item_row.shs_so_gt_tax_net_goods_amt * (this_company_sales_tax_var / 100));
                // Sumatoria de todos los que tengan el check bienes
                let total_goods = 0;
                $.each(frm.doc.items || [], function (i, d) {
                    if (d.shs_so_is_good === 1) {
                        total_goods += flt(d.shs_so_gt_tax_net_goods_amt);
                    };
                });
                frm.doc.shs_so_gt_tax_goods = total_goods;
            };
            if (item_row.shs_so_is_service === 1) {
                frm.doc.items[index].shs_so_gt_tax_net_services_amt = (item_row.shs_so_amount_minus_excise_tax / (1 + (this_company_sales_tax_var / 100)));
                frm.doc.items[index].shs_so_sales_tax_for_this_row = (item_row.shs_so_gt_tax_net_services_amt * (this_company_sales_tax_var / 100));
                // Sumatoria de todos los que tengan el check servicios
                let total_servi = 0;
                $.each(frm.doc.items || [], function (i, d) {
                    if (d.shs_so_is_service === 1) {
                        total_servi += flt(d.shs_so_gt_tax_net_services_amt);
                    };
                });
                frm.doc.shs_so_gt_tax_services = total_servi;
            };
            let full_tax_iva = 0;
            $.each(frm.doc.items || [], function (i, d) {
                full_tax_iva += flt(d.shs_so_sales_tax_for_this_row);
            });
            frm.doc.shs_so_total_iva = full_tax_iva;
        };
    });
}
/*	1.12 en-US: Tax Calculation Conversions for Sales Order END ----------------------*/
/*	1.12 es-GT: Calculos y Conversiones para Orden de Venta TERMINA ------------------*/

/*	1.13 en-US: Tax Calculation Conversions for Delivery Note BEGIN ------------------*/
/*	1.13 es-GT: Calculos y Conversiones para Nota de Entrega EMPIEZA -----------------*/
// Codigo Adaptado para Delivery Note (Nota de entrega)
// Funcion para calculo de impuestos
function shs_delivery_note_calculation(frm, cdt, cdn) {

    refresh_field('items');

    this_company_sales_tax_var = cur_frm.doc.taxes[0].rate;

    var this_row_qty, this_row_rate, this_row_amount, this_row_conversion_factor, this_row_stock_qty, this_row_tax_rate, this_row_tax_amount, this_row_taxable_amount;

    frm.doc.items.forEach((item_row, index) => {
        if (item_row.name == cdn) {
            this_row_amount = (item_row.qty * item_row.rate);
            this_row_stock_qty = (item_row.qty * item_row.conversion_factor);
            this_row_tax_rate = (item_row.shs_dn_tax_rate_per_uom);
            this_row_tax_amount = (this_row_stock_qty * this_row_tax_rate);
            this_row_taxable_amount = (this_row_amount - this_row_tax_amount);
            // Convert a number into a string, keeping only two decimals:
            frm.doc.items[index].shs_dn_other_tax_amount = ((item_row.shs_dn_tax_rate_per_uom * (item_row.qty * item_row.conversion_factor)));
            //OJO!  No s epuede utilizar stock_qty en los calculos, debe de ser qty a puro tubo!
            frm.doc.items[index].shs_dn_amount_minus_excise_tax = ((item_row.qty * item_row.rate) - ((item_row.qty * item_row.conversion_factor) * item_row.shs_dn_tax_rate_per_uom));
            console.log("uom that just changed is: " + item_row.uom);
            console.log("stock qty is: " + item_row.stock_qty); // se queda con el numero anterior.  multiplicar por conversion factor (si existiera!)
            // Por alguna razón esta multiplicando y obteniendo valores negativos  FIXME
			// absoluto? FIXME
			// Que sucedera con una nota de crédito? FIXME
			// Absoluto y luego NEGATIVIZADO!? FIXME
            console.log("conversion_factor is: " + item_row.conversion_factor);
            if (item_row.shs_dn_is_fuel == 1) {
                frm.doc.items[index].shs_dn_gt_tax_net_fuel_amt = (item_row.shs_dn_amount_minus_excise_tax / (1 + (this_company_sales_tax_var / 100)));
                frm.doc.items[index].shs_dn_sales_tax_for_this_row = (item_row.shs_dn_gt_tax_net_fuel_amt * (this_company_sales_tax_var / 100));
                // Sumatoria de todos los que tengan el check combustibles
                total_fuel = 0;
                $.each(frm.doc.items || [], function (i, d) {
                    // total_qty += flt(d.qty);
                    if (d.shs_dn_is_fuel == true) {
                        total_fuel += flt(d.shs_dn_gt_tax_net_fuel_amt);
                    };
                });
                frm.doc.shs_dn_gt_tax_fuel = total_fuel;
                //frm.refresh_field("factelec_p_is_fuel");
            };
            if (item_row.shs_dn_is_good == 1) {
                frm.doc.items[index].shs_dn_gt_tax_net_goods_amt = (item_row.shs_dn_amount_minus_excise_tax / (1 + (this_company_sales_tax_var / 100)));
                frm.doc.items[index].shs_dn_sales_tax_for_this_row = (item_row.shs_dn_gt_tax_net_goods_amt * (this_company_sales_tax_var / 100));
                // Sumatoria de todos los que tengan el check bienes
                total_goods = 0;
                $.each(frm.doc.items || [], function (i, d) {
                    if (d.shs_dn_is_good == true) {
                        total_goods += flt(d.shs_dn_gt_tax_net_goods_amt);
                    };
                });
                frm.doc.shs_dn_gt_tax_goods = total_goods;
            };
            if (item_row.shs_dn_is_service == 1) {
                frm.doc.items[index].shs_dn_gt_tax_net_services_amt = (item_row.shs_dn_amount_minus_excise_tax / (1 + (this_company_sales_tax_var / 100)));
                frm.doc.items[index].shs_dn_sales_tax_for_this_row = (item_row.shs_dn_gt_tax_net_services_amt * (this_company_sales_tax_var / 100));
                // Sumatoria de todos los que tengan el check servicios
                total_servi = 0;
                $.each(frm.doc.items || [], function (i, d) {
                    if (d.shs_dn_is_service == true) {
                        total_servi += flt(d.shs_dn_gt_tax_net_services_amt);
                    };
                });
                frm.doc.shs_dn_gt_tax_services = total_servi;
            };
            full_tax_iva = 0;
            $.each(frm.doc.items || [], function (i, d) {
                full_tax_iva += flt(d.shs_dn_sales_tax_for_this_row);
            });
            frm.doc.shs_dn_total_iva = full_tax_iva;
        };
    });
}
/*	1.13 en-US: Tax Calculation Conversions for Delivery Note END --------------------*/
/*	1.13 es-GT: Calculos y Conversiones para Nota de Entrega TERMINA -----------------*/

/*	1.14 en-US: Tax Calculation Conversions for Supplier Quotation BEGIN -------------*/
/*	1.14 es-GT: Calculos y Conversiones para Presupuesto de Proveedor EMPIEZA --------*/
// Codigo Adaptado para Supplier Quotation (Presupuesto de Proveedor)
// Funcion para calculo de impuestos
function shs_supplier_quotation_calculation(frm, cdt, cdn) {

    refresh_field('items');

    this_company_sales_tax_var = cur_frm.doc.taxes[0].rate;

    var this_row_qty, this_row_rate, this_row_amount, this_row_conversion_factor, this_row_stock_qty, this_row_tax_rate, this_row_tax_amount, this_row_taxable_amount;

    frm.doc.items.forEach((item_row, index) => {
        if (item_row.name == cdn) {
            this_row_amount = (item_row.qty * item_row.rate);
            this_row_stock_qty = (item_row.qty * item_row.conversion_factor);
            this_row_tax_rate = (item_row.shs_spq_tax_rate_per_uom);
            this_row_tax_amount = (this_row_stock_qty * this_row_tax_rate);
            this_row_taxable_amount = (this_row_amount - this_row_tax_amount);
            // Convert a number into a string, keeping only two decimals:
            frm.doc.items[index].shs_spq_other_tax_amount = ((item_row.shs_spq_tax_rate_per_uom * (item_row.qty * item_row.conversion_factor)));
            //OJO!  No s epuede utilizar stock_qty en los calculos, debe de ser qty a puro tubo!
            frm.doc.items[index].shs_spq_amount_minus_excise_tax = ((item_row.qty * item_row.rate) - ((item_row.qty * item_row.conversion_factor) * item_row.shs_spq_tax_rate_per_uom));
            console.log("uom that just changed is: " + item_row.uom);
            console.log("stock qty is: " + item_row.stock_qty); // se queda con el numero anterior.  multiplicar por conversion factor (si existiera!)
            // Por alguna razón esta multiplicando y obteniendo valores negativos  FIXME
			// absoluto? FIXME
			// Que sucedera con una nota de crédito? FIXME
			// Absoluto y luego NEGATIVIZADO!? FIXME
            console.log("conversion_factor is: " + item_row.conversion_factor);
            if (item_row.shs_spq_is_fuel == 1) {
                frm.doc.items[index].shs_spq_gt_tax_net_fuel_amt = (item_row.shs_spq_amount_minus_excise_tax / (1 + (this_company_sales_tax_var / 100)));
                frm.doc.items[index].shs_spq_sales_tax_for_this_row = (item_row.shs_spq_gt_tax_net_fuel_amt * (this_company_sales_tax_var / 100));
                // Sumatoria de todos los que tengan el check combustibles
                total_fuel = 0;
                $.each(frm.doc.items || [], function (i, d) {
                    // total_qty += flt(d.qty);
                    if (d.shs_spq_is_fuel == true) {
                        total_fuel += flt(d.shs_spq_gt_tax_net_fuel_amt);
                    };
                });
                frm.doc.shs_spq_gt_tax_fuel = total_fuel;
                //frm.refresh_field("factelec_p_is_fuel");
            };
            if (item_row.shs_spq_is_good == 1) {
                frm.doc.items[index].shs_spq_gt_tax_net_goods_amt = (item_row.shs_spq_amount_minus_excise_tax / (1 + (this_company_sales_tax_var / 100)));
                frm.doc.items[index].shs_spq_sales_tax_for_this_row = (item_row.shs_spq_gt_tax_net_goods_amt * (this_company_sales_tax_var / 100));
                // Sumatoria de todos los que tengan el check bienes
                total_goods = 0;
                $.each(frm.doc.items || [], function (i, d) {
                    if (d.shs_spq_is_good == true) {
                        total_goods += flt(d.shs_spq_gt_tax_net_goods_amt);
                    };
                });
                frm.doc.shs_spq_gt_tax_goods = total_goods;
            };
            if (item_row.shs_spq_is_service == 1) {
                frm.doc.items[index].shs_spq_gt_tax_net_services_amt = (item_row.shs_spq_amount_minus_excise_tax / (1 + (this_company_sales_tax_var / 100)));
                frm.doc.items[index].shs_spq_sales_tax_for_this_row = (item_row.shs_spq_gt_tax_net_services_amt * (this_company_sales_tax_var / 100));
                // Sumatoria de todos los que tengan el check servicios
                total_servi = 0;
                $.each(frm.doc.items || [], function (i, d) {
                    if (d.shs_spq_is_service == true) {
                        total_servi += flt(d.shs_spq_gt_tax_net_services_amt);
                    };
                });
                frm.doc.shs_spq_gt_tax_services = total_servi;
            };
            full_tax_iva = 0;
            $.each(frm.doc.items || [], function (i, d) {
                full_tax_iva += flt(d.shs_spq_sales_tax_for_this_row);
            });
            frm.doc.shs_spq_total_iva = full_tax_iva;
        };
    });
}
/*	1.14 en-US: Tax Calculation Conversions for Supplier Quotation END ---------------*/
/*	1.14 es-GT: Calculos y Conversiones para Presupuesto de Proveedor TERMINA --------*/

/*	1 en-US: Functions END <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<*/
/*	1 es-GT: Funciones TERMINAN <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<*/

/*	2 en-US: Triggers BEGIN <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<*/
/*	2 es-GT: Disparadores EMPIEZAN <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<*/

/*	2.1 en-US: Triggers for Sales Invoice BEGIN --------------------------------------*/
/*	2.1 es-GT: Disparadores para Factura de Venta EMPIEZAN  --------------------------*/
frappe.ui.form.on("Sales Invoice", {
	onload_post_render: function(frm, cdt, cdn){
		console.log('Funcionando Onload Post Render Trigger'); //SI FUNCIONA EL TRIGGER
		// Funciona unicamente cuando se carga por primera vez el documento y aplica unicamente para el form y no childtables
		
		// en-US: Enabling event listeners for child tables
		// es-GT: Habilitando escuchadores de eventos en las tablas hijas del tipo de documento principal
		// No corra KEY UP, KEY PRESS, KEY DOWN en este campo!   NO NO NO NO NONONO
		// FIXME FIXME FIXME
		// Objetivo, cuando se salga del campo mediante TAB, que quede registrado el producto.
		// estrategia 1:  Focus al campo de quantity?  NO SIRVE.  Como que hay OTRO campo antes, quizas la flechita de link?
		
		frm.fields_dict.items.grid.wrapper.on('click focusout blur', 'input[data-fieldname="item_code"][data-doctype="Sales Invoice Item"]', function(e) {
			//console.log("Clicked on the field Item Code");
			each_item(frm, cdt, cdn);
			//facelec_tax_calc_new(frm, cdt, cdn);
			// setTimeout(function() { facelec_tax_calc_new(frm, cdt, cdn); }, 100);
		});
		
				/*frm.fields_dict.items.grid.wrapper.on('focusout', 'input[data-fieldname="item_code"][data-doctype="Sales Invoice Item"]', function(e) {
			console.log("Now pressing on the Item Code Field");
			//each_item(frm, cdt, cdn);
		});*/
			// FIXME NO FUNCIONA CON TAB, SOLO HACIENDO CLICK Y ENTER.  Si se presiona TAB, SE BORRA!
		/*frm.fields_dict.items.grid.wrapper.on('blur', 'input[data-fieldname="item_code"][data-doctype="Sales Invoice Item"]', function(e) {
			console.log("Blurred away from the Item Code Field");
			each_item(frm, cdt, cdn);
			//facelec_tax_calc_new(frm, cdt, cdn);
		});*/
		// Item Code field update when mouse leaves. Just leave it to blur, otherwise data might be replaced unkowingly.
		/*frm.fields_dict.items.grid.wrapper.on('mouseleave', 'input[data-fieldname="item_code"][data-doctype="Sales Invoice Item"]', function(e) {
			console.log("The mouse left the Item Code Field");
			setTimeout(function() { facelec_tax_calc_new(frm, cdt, cdn) }, 100);
		}); */
		frm.fields_dict.items.grid.wrapper.on('click', 'input[data-fieldname="uom"][data-doctype="Sales Invoice Item"]', function(e) {
			console.log("Click on the UOM field");
			each_item(frm, cdt, cdn);
			//setTimeout(function() { facelec_tax_calc_new(frm, cdt, cdn); }, 100);
		});
		frm.fields_dict.items.grid.wrapper.on('blur focusout', 'input[data-fieldname="uom"][data-doctype="Sales Invoice Item"]', function(e) {
			console.log("Blur or focusout from the UOM field");
			each_item(frm, cdt, cdn);
			//setTimeout(function() { facelec_tax_calc_new(frm, cdt, cdn); }, 100);
		});
		// Do not refresh with each_item in Mouse leave! just recalculate
		frm.fields_dict.items.grid.wrapper.on('mouseleave', 'input[data-fieldname="uom"][data-doctype="Sales Invoice Item"]', function(e) {
			console.log("Mouse left the UOM field");
			facelec_tax_calc_new(frm, cdt, cdn);
		});
		// This part might seem counterintuitive, but it is the "next" field in tab order after item code, which helps for a "creative" strategy to update everything after pressing TAB out of the item code field.  FIXME
		frm.fields_dict.items.grid.wrapper.on('focus', 'input[data-fieldname="item_name"][data-doctype="Sales Invoice Item"]', function(e) {
			console.log("Focusing with keyboard cursor through TAB on the Item Name Field");
			each_item(frm, cdt, cdn);
		});
		frm.fields_dict.items.grid.wrapper.on('blur focusout', 'input[data-fieldname="qty"][data-doctype="Sales Invoice Item"]', function(e) {
			console.log("Blurring or focusing out from the Quantity Field");
			each_item(frm, cdt, cdn);
			//setTimeout(function() { facelec_tax_calc_new(frm, cdt, cdn); }, 100);
		});
		// Do not refresh with each_item in Mouse leave! just recalculate
		frm.fields_dict.items.grid.wrapper.on('mouseleave', 'input[data-fieldname="qty"][data-doctype="Sales Invoice Item"]', function(e) {
			console.log("Mouse leaving from the Quantity Field");
			facelec_tax_calc_new(frm, cdt, cdn);
		});
		// Quantity field update when mouse leaves. Just leave it to blur, otherwise data might be replaced unkowingly.
		/*frm.fields_dict.items.grid.wrapper.on('mouseleave', 'input[data-fieldname="qty"][data-doctype="Sales Invoice Item"]', function(e) {
			console.log("The mouse left the Quantity Field");
			setTimeout(function() { facelec_tax_calc_new(frm, cdt, cdn) }, 100);
		});*/
		// UOM field update when mouse leaves. Just leave it to blur, otherwise data might be replaced unkowingly.
		/*frm.fields_dict.items.grid.wrapper.on('mouseleave', 'input[data-fieldname="uom"][data-doctype="Sales Invoice Item"]', function(e) {
			console.log("The mouse left the UOM Field");
			setTimeout(function() { facelec_tax_calc_new(frm, cdt, cdn) }, 100);
		});*/
		// DO NOT USE Keyup, ??  FIXME FIXME FIXME FIXME FIXME  este hace calculos bien
		frm.fields_dict.items.grid.wrapper.on('blur focusout', 'input[data-fieldname="conversion_factor"][data-doctype="Sales Invoice Item"]', function(e) {
			console.log("Blurring or focusing out from the Conversion Factor Field");
			//  IMPORTANT! IMPORTANT!  This is the one that gets the calculations correct!
			// Trying to calc first, then refresh, or no refresh at all...
			each_item(frm, cdt, cdn);
			cur_frm.refresh_field("conversion_factor");
			//facelec_tax_calc_new(frm, cdt, cdn);
			//setTimeout(function() { facelec_tax_calc_new(frm, cdt, cdn); }, 100);
			// Running it twice, does not help to clear the variables our when calculating based on new conversion factor. It lags. FIXME
			//fields_dict.items.wrapper.innerText or FIXME
			//fields_dict.items.$wrapper.innerText FIXME
			// find a way to realod this wrapper once more, so that proper data is set with innerHTML. FIXME
			//setTimeout(function() { facelec_tax_calc_new(frm, cdt, cdn) }, 100);
		});
		// This specific one is only for keyup events, to recalculate all. Only on blur will it refresh everything!
		// Do not refresh with each_item in Mouse leave OR keyup! just recalculate
		frm.fields_dict.items.grid.wrapper.on('keyup mouseleave focusout', 'input[data-fieldname="conversion_factor"][data-doctype="Sales Invoice Item"]', function(e) {
			console.log("Key up, mouse leave or focus out from the Conversion Factor Field");
			// Trying to calc first, then refresh, or no refresh at all...
			facelec_tax_calc_new(frm, cdt, cdn);
			cur_frm.refresh_field("conversion_factor");
		});
		// Conversion Factor field update when mouse leaves. Just leave it to blur, otherwise data might be replaced unkowingly.
		/*frm.fields_dict.items.grid.wrapper.on('mouseleave', 'input[data-fieldname="conversion_factor"][data-doctype="Sales Invoice Item"]', function(e) {
			console.log("The mouse left the Conversion Factor Field");
			setTimeout(function() { facelec_tax_calc_new(frm, cdt, cdn) }, 100);
		});*/
		frm.fields_dict.items.grid.wrapper.on('blur', 'input[data-fieldname="rate"][data-doctype="Sales Invoice Item"]', function(e) {
			console.log("Blurring from the Rate Field");
			each_item(frm, cdt, cdn);
			//setTimeout(function() { facelec_tax_calc_new(frm, cdt, cdn) }, 100);
		});
		// Rate field update when mouse leaves. Just leave it to blur, otherwise data might be replaced unkowingly.
		/*frm.fields_dict.items.grid.wrapper.on('mouseleave', 'input[data-fieldname="rate"][data-doctype="Sales Invoice Item"]', function(e) {
			console.log("The mouse left the Rate Field");
			setTimeout(function() { facelec_tax_calc_new(frm, cdt, cdn) }, 100);
		});*/
		// en-US: Enabling event listeners in the main doctype
		// es-GT: Habilitando escuchadores de eventos en el tipo de documento principal
		// When ANY key is released after being pressed
		cur_frm.fields_dict.customer.$input.on("keyup", function(evt){
			console.log("Se acaba de soltar una tecla del campo customer");
			facelec_tax_calc_new(frm, cdt, cdn);
			//setTimeout(function() { facelec_tax_calc_new(frm, cdt, cdn) }, 100);
			refresh_field('qty');
		});
		// When mouse leaves the field
		cur_frm.fields_dict.customer.$input.on("mouseleave", function(evt){
			console.log("Puntero de Ratón Salió del campo customer");
			facelec_tax_calc_new(frm, cdt, cdn);
			//setTimeout(function() { facelec_tax_calc_new(frm, cdt, cdn) }, 100);
		});
		// Blur from the field
		cur_frm.fields_dict.customer.$input.on("blur", function(evt){
			console.log("Campo customer perdió el enfoque, saliendo del campo...");
			facelec_tax_calc_new(frm, cdt, cdn);
			//setTimeout(function() { facelec_tax_calc_new(frm, cdt, cdn) }, 100);
		});
		// Focusout from the field
		cur_frm.fields_dict.customer.$input.on("focusout", function(evt){
			console.log("Campo customer perdió el enfoque via focusout");
			facelec_tax_calc_new(frm, cdt, cdn);
			//setTimeout(function() { facelec_tax_calc_new(frm, cdt, cdn) }, 100);
		});
		// Mouse moves over the items field   WORKS OK!
		/*cur_frm.fields_dict.items.$wrapper.on("mousemove", function(evt){
			console.log("Puntero de Ratón se movio en el campo Items");
		});*/
		// Key is released from any field within items child table. WORKS OK!
		/*cur_frm.fields_dict.items.$wrapper.on("keyup", function(evt){
			console.log("Se solto una tecla en el campo de items");
		});*/
		// Mouse clicks over the items field
		cur_frm.fields_dict.items.$wrapper.on("click", function(evt){
			console.log("Puntero de Ratón hizo click en el campo Items");
			each_item(frm, cdt, cdn);
		});
		/*cur_frm.body.$input.on("mousemove", function(evt){
			console.log("Mousemove sobre el body de la pagina");
		});*/
	},
	customer: function (frm, cdt, cdn) {
		// Trigger Cliente
	},
	refresh: function (frm, cdt, cdn) {
		// Trigger refresh de pagina
		// es-GT: Obtiene el numero de Identificacion tributaria ingresado en la hoja del cliente.
		// en-US: Fetches the Taxpayer Identification Number entered in the Customer doctype.
		cur_frm.add_fetch("customer", "nit_face_customer", "nit_face_customer");

		// WORKS OK!
		frm.add_custom_button("UOM Recalculation", function () {
			frm.doc.items.forEach((item) => {
				// for each button press each line is being processed.
				console.log("item contains: " + item);
				//Importante
				facelec_tax_calc_new(frm, "Sales Invoice Item", item.name);
			});
		});

		verificacionCAE(frm, cdt, cdn);
	},
	nit_face_customer: function (frm, cdt, cdn) {
		// Funcion para validar NIT: Se ejecuta cuando exista un cambio en el campo de NIT
		valNit(frm.doc.nit_face_customer, frm.doc.customer, frm)
	},
	additional_discount_percentage: function (frm, cdt, cdn) {
		// Pensando en colocar un trigger aqui para cuando se actualice el campo de descuento adicional
	},
	discount_amount: function (frm, cdt, cdn) {
        // Trigger Monto de descuento
        tax_before_calc = frm.doc.facelec_total_iva;
        console.log("El descuento total es:" + frm.doc.discount_amount);
		// es-GT: Este muestra el IVA que se calculo por medio de nuestra aplicación.
        console.log("El IVA calculado anteriormente:" + frm.doc.facelec_total_iva);
        discount_amount_net_value = (frm.doc.discount_amount / (1 + (cur_frm.doc.taxes[0].rate / 100)));
		
		if (discount_amount_net_value == NaN || discount_amount_net_value == undefined) {
			console.log("No hay descuento definido, calculando sin descuento.");
		} else { 
			console.log("El descuento parece ser un numero definido, calculando con descuento.");
			discount_amount_tax_value = (discount_amount_net_value * (cur_frm.doc.taxes[0].rate / 100));
			console.log("El IVA del descuento es:" + discount_amount_tax_value);
			frm.doc.facelec_total_iva = (frm.doc.facelec_total_iva - discount_amount_tax_value);
			console.log("El IVA ya sin el iva del descuento es ahora:" + frm.doc.facelec_total_iva);
		}
	},
	before_save: function (frm, cdt, cdn) {
		each_item(frm, cdt, cdn);
		// Trigger antes de guardar
		/*frm.doc.items.forEach((item) => {
			// for each button press each line is being processed.
			console.log("item contains: " + item);
			//Importante
			// TODO: Mario, aqui veo que le estas pasando argumentos, es quizás esto lo que me falta?
			facelec_tax_calc_new(frm, "Sales Invoice Item", item.name);
			tax_before_calc = frm.doc.facelec_total_iva;
			console.log("El descuento total es:" + frm.doc.discount_amount);
			console.log("El IVA calculado anteriormente:" + frm.doc.facelec_total_iva);
			discount_amount_net_value = (frm.doc.discount_amount / (1 + (cur_frm.doc.taxes[0].rate / 100)));
			if (discount_amount_net_value == NaN || discount_amount_net_value == undefined) {
				console.log("No hay descuento definido, calculando sin descuento.");
			} else { 
				console.log("El descuento parece ser un numero definido, calculando con descuento.");
				console.log("El neto sin iva del descuento es" + discount_amount_net_value);
				discount_amount_tax_value = (discount_amount_net_value * (cur_frm.doc.taxes[0].rate / 100));
				console.log("El IVA del descuento es:" + discount_amount_tax_value);
				frm.doc.facelec_total_iva = (frm.doc.facelec_total_iva - discount_amount_tax_value);
				console.log("El IVA ya sin el iva del descuento es ahora:" + frm.doc.facelec_total_iva);
			}
		});*/
	},
	on_submit: function (frm, cdt, cdn) {
        // Ocurre cuando se presione el boton validar.
        // Cuando se valida el documento, se hace la consulta al servidor por medio de frappe.call
        // con esto se obtiene la configuracion guardada, ya sea automatico o manual
        // FUNCION AUTOMATICA: Cuando se valida el documento automaticamente genera la estrucutura para la factura solicitada
        // y realiza la peticion a INFILE para la generacion, respuesta y guardado en nuestra base de datos.
        frappe.call({
            method: "factura_electronica.api.obtenerConfiguracionManualAutomatica",
            // El callback recibe como parametro el dato retornado por script python del lado del servidor
            callback: function (data) {
                console.log(data.message)
                if (data.message === 'Manual') {
                    console.log('Configuracion encontrada: MANUAL');
                    // No es necesario tener activa esta parte, ya que cuando se ingresa a cualquier factura en el evento
                    // refresh, hay una funcion que se encarga de comprobar de que se haya generado exitosamente la 
                    // factura electronica, en caso no sea asi, se mostrarán los botones correspondientes, para hacer
                    // la generacion de la factura electronica manualmente.
                    // generarFacturaBTN(frm, cdt, cdn);
                }
                if (data.message === 'Automatico') {
                    console.log('Configuracion encontrada: AUTOMATICO');
                    generarFacturaSINBTN(frm, cdt, cdn);
                    verificacionCAE(frm, cdt, cdn);
                }
            }
        });
    }
	/* onload: function (frm, cdt, cdn) {
		/* Cuando se carge el documento por completo realizara la comprobacion de que se haya generado el CAE para el documento requerido.
		verificacionCAE(frm, cdt, cdn);
		},*/
});
/*	2.1 en-US: Triggers for Sales Invoice END ----------------------------------------*/
/*	2.1 es-GT: Disparadores para Factura de Venta TERMINAN  --------------------------*/

/*	2.2 en-US: Triggers for Sales Invoice Items BEGIN --------------------------------*/
/*	2.2 es-GT: Disparadores para Productos de Factura de Venta EMPIEZAN  -------------*/
frappe.ui.form.on("Sales Invoice Item", {
    items_add: function (frm, cdt, cdn) {},
    items_move: function (frm, cdt, cdn) {},
    before_items_remove: function (frm, cdt, cdn) {},
    items_remove: function (frm, cdt, cdn) {
        // es-GT: Este disparador corre al momento de eliminar una nueva fila.
        // en-US: This trigger runs when removing a row.
        // console.log('Trigger remove en tabla hija');

        // Vuelve a calcular los totales de FUEL, GOODS, SERVICES e IVA cuando se elimina una fila.
        fix_gt_tax_fuel = 0;
        fix_gt_tax_goods = 0;
        fix_gt_tax_services = 0;
        fix_gt_tax_iva = 0;

        $.each(frm.doc.items || [], function (i, d) {

            fix_gt_tax_fuel += flt(d.facelec_gt_tax_net_fuel_amt);
            fix_gt_tax_goods += flt(d.facelec_gt_tax_net_goods_amt);
            fix_gt_tax_services += flt(d.facelec_gt_tax_net_services_amt);
            fix_gt_tax_iva += flt(d.facelec_sales_tax_for_this_row);

        });

        cur_frm.set_value("facelec_gt_tax_fuel", fix_gt_tax_fuel);
        cur_frm.set_value("facelec_gt_tax_goods", fix_gt_tax_goods);
        cur_frm.set_value("facelec_gt_tax_services", fix_gt_tax_services);
        cur_frm.set_value("facelec_total_iva", fix_gt_tax_iva);
    },
    item_code: function (frm, cdt, cdn) {

        // Trigger codigo de producto
        //this_company_sales_tax_var = cur_frm.doc.taxes[0].rate;
        //console.log("If you can see this, tax rate variable now exists, and its set to: " + this_company_sales_tax_var);
        refresh_field('qty');

    },
    qty: function (frm, cdt, cdn) {
        //facelec_tax_calculation(frm, cdt, cdn);
        facelec_tax_calc_new(frm, cdt, cdn);
        console.log("cdt contains: " + cdt);
        console.log("cdn contains: " + cdn);
    },
    uom: function (frm, cdt, cdn) {
        // Trigger UOM
        console.log("The unit of measure field was changed and the code from the trigger was run");
    },
    conversion_factor: function (frm, cdt, cdn) {
        // Trigger factor de conversion
        console.log("El disparador de factor de conversión se corrió.");
        facelec_tax_calc_new(frm, cdt, cdn);
    },
    facelec_tax_rate_per_uom_account: function (frm, cdt, cdn) {
        // Eleccion de este trigger para la adicion de filas en taxes con sus respectivos valores.
        frm.doc.items.forEach((item_row_i, index_i) => {
            if (item_row_i.name == cdn) {
                var cuenta = item_row_i.facelec_tax_rate_per_uom_account;
                if (cuenta !== null) {
                    if (buscar_account(frm, cuenta)) {
                        console.log('La cuenta de impuestos y cargos ya existe en la tabla Taxes and Charges');
                    } else {
                        console.log('La cuenta no existe, se agregara una nueva fila en taxes');
                        frappe.model.add_child(frm.doc, "Sales Taxes and Charges", "taxes");
                        frm.doc.taxes.forEach((item_row, index) => {
                            if (item_row.account_head == undefined) {
                                frappe.call({
                                    method: "factura_electronica.api.get_data_tax_account",
                                    args: {
                                        name_account_tax_gt: cuenta
                                    },
                                    // El callback recibe como parametro el dato retornado por script python del lado del servidor
                                    callback: function (data) {
                                        // Asigna los valores retornados del servidor
                                        frm.doc.taxes[index].charge_type = 'On Net Total'; // Opcion 1: Actual, Opcion 2: On Net Total, Opcion 3: On Previous Row Amount, Opcion 4: On Previous Row Total
                                        frm.doc.taxes[index].account_head = cuenta;
                                        frm.doc.taxes[index].rate = data.message;
                                        //item_row.account_head = cuenta;
                                        //refresh_field("taxes");
                                        frm.doc.taxes[index].description = 'Impuesto';
                                    }
                                });
                            }
                        });
                    }
                } else {
                    console.log('El producto seleccionado no tiene una cuenta asociada');
                }
            }
        });
    },
    rate: function (frm, cdt, cdn) {
        facelec_tax_calculation(frm, cdt, cdn);
    },
    /*onload_post_render: function(frm, cdt, cdn){
		console.log('Funcionando Onload Post Render Trigger'); //SI FUNCIONA EL TRIGGER
		// Funciona unicamente cuando se carga por primera vez el documento y aplica unicamente para el form y no childtables
		
		// Esta es la adaptación para poder agregarle "listener" o "disparadores" al campo específico.
    }*/
});
/*	2.2 en-US: Triggers for Sales Invoice Items END ----------------------------------*/
/*	2.2 es-GT: Disparadores para Productos de Factura de Venta TERMINAN  -------------*/

/*	2.3 en-US: Triggers for Purchase Invoice BEGIN -----------------------------------*/
/*	2.3 es-GT: Disparadores para Factura de Compra EMPIEZAN  -------------------------*/
frappe.ui.form.on("Purchase Invoice", {
    refresh: function (frm, cdt, cdn) {
        // Trigger refresh de pagina
        console.log('Exito Script In Purchase Invoice');
        // Boton para recalcular
        frm.add_custom_button("UOM Recalculation", function () {
            frm.doc.items.forEach((item) => {
                // for each button press each line is being processed.
                console.log("item contains: " + item);
                //Importante
                shs_purchase_invoice_calculation(frm, "Purchase Invoice Item", item.name);
            });
        });
    },
    facelec_nit_fproveedor: function (frm, cdt, cdn) {
        // Funcion para validar NIT: Se ejecuta cuando exista un cambio en el campo de NIT
        valNit(frm.doc.facelec_nit_fproveedor, frm.doc.supplier, frm);
    },
    discount_amount: function (frm, cdt, cdn) {
        // Trigger Monto de descuento
        tax_before_calc = frm.doc.facelec_p_total_iva;
        console.log("El descuento total es:" + frm.doc.discount_amount);
        console.log("El IVA calculado anteriormente:" + frm.doc.facelec_p_total_iva);
        discount_amount_net_value = (frm.doc.discount_amount / (1 + (cur_frm.doc.taxes[0].rate / 100)));
        console.log("El neto sin iva del descuento es" + discount_amount_net_value);
        discount_amount_tax_value = (discount_amount_net_value * (cur_frm.doc.taxes[0].rate / 100));
        console.log("El IVA del descuento es:" + discount_amount_tax_value);
        frm.doc.facelec_p_total_iva = (frm.doc.facelec_p_total_iva - discount_amount_tax_value);
        console.log("El IVA ya sin el iva del descuento es ahora:" + frm.doc.facelec_p_total_iva);
    },
    supplier: function (frm, cdt, cdn) {
        // Trigger Proveedor
        this_company_sales_tax_var = cur_frm.doc.taxes[0].rate;
        console.log('Corrio supplier trigger y se cargo el IVA, el cual es ' + this_company_sales_tax_var);
    },
    before_save: function (frm, cdt, cdn) {
        // Trigger antes de guardar
        frm.doc.items.forEach((item) => {
            // for each button press each line is being processed.
            console.log("item contains: " + item);
            //Importante
            shs_purchase_invoice_calculation(frm, "Purchase Invoice Item", item.name);
            tax_before_calc = frm.doc.facelec_p_total_iva;
            console.log("El descuento total es:" + frm.doc.discount_amount);
            console.log("El IVA calculado anteriormente:" + frm.doc.facelec_p_total_iva);
            discount_amount_net_value = (frm.doc.discount_amount / (1 + (cur_frm.doc.taxes[0].rate / 100)));
            console.log("El neto sin iva del descuento es" + discount_amount_net_value);
            discount_amount_tax_value = (discount_amount_net_value * (cur_frm.doc.taxes[0].rate / 100));
            console.log("El IVA del descuento es:" + discount_amount_tax_value);
            frm.doc.facelec_p_total_iva = (frm.doc.facelec_p_total_iva - discount_amount_tax_value);
            console.log("El IVA ya sin el iva del descuento es ahora:" + frm.doc.facelec_p_total_iva);
        });
    },
});
/*	2.3 en-US: Triggers for Purchase Invoice END -------------------------------------*/
/*	2.3 es-GT: Disparadores para Factura de Compra TERMINAN  -------------------------*/

/*	2.4 en-US: Triggers for Purchase Invoice Items BEGIN -----------------------------*/
/*	2.4 es-GT: Disparadores para Productos de Factura de Compra EMPIEZAN  ------------*/
frappe.ui.form.on("Purchase Invoice Item", {
    items_add: function (frm, cdt, cdn) {},
    items_move: function (frm, cdt, cdn) {},
    before_items_remove: function (frm, cdt, cdn) {},
    items_remove: function (frm, cdt, cdn) {
        // es-GT: Este disparador corre al momento de eliminar una nueva fila.
        // en-US: This trigger runs when removing a row.
        // Vuelve a calcular los totales de FUEL, GOODS, SERVICES e IVA cuando se elimina una fila.
        fix_gt_tax_fuel = 0;
        fix_gt_tax_goods = 0;
        fix_gt_tax_services = 0;
        fix_gt_tax_iva = 0;

        $.each(frm.doc.items || [], function (i, d) {
            fix_gt_tax_fuel += flt(d.facelec_p_gt_tax_net_fuel_amt);
            fix_gt_tax_goods += flt(d.facelec_p_gt_tax_net_goods_amt);
            fix_gt_tax_services += flt(d.facelec_p_gt_tax_net_services_amt);
            fix_gt_tax_iva += flt(d.facelec_p_sales_tax_for_this_row);
        });

        cur_frm.set_value("facelec_p_gt_tax_fuel", fix_gt_tax_fuel);
        cur_frm.set_value("facelec_p_gt_tax_goods", fix_gt_tax_goods);
        cur_frm.set_value("facelec_p_gt_tax_services", fix_gt_tax_services);
        cur_frm.set_value("facelec_p_total_iva", fix_gt_tax_iva);
    },
    item_code: function (frm, cdt, cdn) {
        // Trigger codigo de producto
        this_company_sales_tax_var = cur_frm.doc.taxes[0].rate;
        console.log("If you can see this, tax rate variable now exists, and its set to: " + this_company_sales_tax_var);
        refresh_field('qty');
    },
    qty: function (frm, cdt, cdn) {
        // Trigger cantidad
        shs_purchase_invoice_calculation(frm, cdt, cdn);
        console.log("cdt contains: " + cdt);
        console.log("cdn contains: " + cdn);
    },
    uom: function (frm, cdt, cdn) {
        // Trigger UOM
        console.log("The unit of measure field was changed and the code from the trigger was run");
    },
    conversion_factor: function (frm, cdt, cdn) {
        // Trigger factor de conversion
        console.log("El disparador de factor de conversión se corrió.");
        shs_purchase_invoice_calculation(frm, cdt, cdn);
    },
    facelec_p_tax_rate_per_uom_account: function (frm, cdt, cdn) {
        // Eleccion de este trigger para la adicion de filas en taxes con sus respectivos valores.
        frm.doc.items.forEach((item_row_i, index_i) => {
            if (item_row_i.name == cdn) {
                var cuenta = item_row_i.facelec_p_tax_rate_per_uom_account;
                if (cuenta !== null) {
                    if (buscar_account(frm, cuenta)) {
                        console.log('La cuenta de impuestos y cargos ya existe en la tabla Taxes and Charges');
                    } else {
                        console.log('La cuenta de impuestos y cargos no existe, se agregara una nueva fila en Taxes and Charges');
                        frappe.model.add_child(frm.doc, "Sales Taxes and Charges", "taxes");
                        frm.doc.taxes.forEach((item_row, index) => {
                            if (item_row.account_head == undefined) {
                                frappe.call({
                                    method: "factura_electronica.api.get_data_tax_account",
                                    args: {
                                        name_account_tax_gt: cuenta
                                    },
                                    // El callback recibe como parametro el dato retornado por script python del lado del servidor
                                    callback: function (data) {
                                        // Asigna los valores retornados del servidor
                                        frm.doc.taxes[index].charge_type = 'On Net Total'; // Opcion 1: Actual, Opcion 2: On Net Total, Opcion 3: On Previous Row Amount, Opcion 4: On Previous Row Total
                                        frm.doc.taxes[index].account_head = cuenta;
                                        frm.doc.taxes[index].rate = data.message;
                                        //item_row.account_head = cuenta;
                                        //refresh_field("taxes");
                                        frm.doc.taxes[index].description = 'Impuesto';
                                    }
                                });
                            }
                        });
                    }
                } else {
                    console.log('El producto seleccionado no tiene una cuenta asociada');
                }
            }
        });
    },
    rate: function (frm, cdt, cdn) {
        shs_purchase_invoice_calculation(frm, cdt, cdn);
    }
});
/*	2.4 en-US: Triggers for Purchase Invoice Items END -------------------------------*/
/*	2.4 es-GT: Disparadores para Productos de Factura de Compra TERMINAN  ------------*/

/*	2.5 en-US: Triggers for Quotation BEGIN ------------------------------------------*/
/*	2.5 es-GT: Disparadores para Cotización EMPIEZA  ---------------------------------*/
frappe.ui.form.on("Quotation", {
    refresh: function (frm, cdt, cdn) {
        // Trigger refresh de pagina
        console.log('Exito Script In Quotation');
        // Boton para recalcular
        frm.add_custom_button("UOM Recalculation", function () {
            frm.doc.items.forEach((item) => {
                // for each button press each line is being processed.
                console.log("item contains: " + item);
                //Importante
                shs_quotation_calculation(frm, "Quotation Item", item.name);
            });
        });
    },
    facelec_qt_nit: function (frm, cdt, cdn) {
        // Funcion para validar NIT: Se ejecuta cuando exista un cambio en el campo de NIT
        valNit(frm.doc.facelec_qt_nit, frm.doc.customer, frm);
    },
    discount_amount: function (frm, cdt, cdn) {
        // Trigger Monto de descuento
        tax_before_calc = frm.doc.facelec_qt_total_iva;
        console.log("El descuento total es:" + frm.doc.discount_amount);
        console.log("El IVA calculado anteriormente:" + frm.doc.facelec_qt_total_iva);
        discount_amount_net_value = (frm.doc.discount_amount / (1 + (cur_frm.doc.taxes[0].rate / 100)));
        console.log("El neto sin iva del descuento es" + discount_amount_net_value);
        discount_amount_tax_value = (discount_amount_net_value * (cur_frm.doc.taxes[0].rate / 100));
        console.log("El IVA del descuento es:" + discount_amount_tax_value);
        frm.doc.facelec_qt_total_iva = (frm.doc.facelec_qt_total_iva - discount_amount_tax_value);
        console.log("El IVA ya sin el iva del descuento es ahora:" + frm.doc.facelec_qt_total_iva);
    },
    customer: function (frm, cdt, cdn) {
        // Trigger Proveedor
        this_company_sales_tax_var = cur_frm.doc.taxes[0].rate;
        console.log('Corrio customer trigger y se cargo el IVA, el cual es ' + this_company_sales_tax_var);
    },
    before_save: function (frm, cdt, cdn) {
        // Trigger antes de guardar
        frm.doc.items.forEach((item) => {
            // for each button press each line is being processed.
            console.log("item contains: " + item);
            //Importante
            shs_quotation_calculation(frm, "Quotation Item", item.name);
            tax_before_calc = frm.doc.facelec_qt_total_iva;
            console.log("El descuento total es:" + frm.doc.discount_amount);
            console.log("El IVA calculado anteriormente:" + frm.doc.facelec_qt_total_iva);
            discount_amount_net_value = (frm.doc.discount_amount / (1 + (cur_frm.doc.taxes[0].rate / 100)));
            console.log("El neto sin iva del descuento es" + discount_amount_net_value);
            discount_amount_tax_value = (discount_amount_net_value * (cur_frm.doc.taxes[0].rate / 100));
            console.log("El IVA del descuento es:" + discount_amount_tax_value);
            frm.doc.facelec_qt_total_iva = (frm.doc.facelec_qt_total_iva - discount_amount_tax_value);
            console.log("El IVA ya sin el iva del descuento es ahora:" + frm.doc.facelec_qt_total_iva);
        });
    },
});
/*	2.5 en-US: Triggers for Quotation END --------------------------------------------*/
/*	2.5 es-GT: Disparadores para Cotización TERMINA  ---------------------------------*/

/*	2.6 en-US: Triggers for Quotation Item BEGIN -------------------------------------*/
/*	2.6 es-GT: Disparadores para Producto de Cotización EMPIEZA  ---------------------*/
frappe.ui.form.on("Quotation Item", {
    items_add: function (frm, cdt, cdn) {},
    items_move: function (frm, cdt, cdn) {},
    before_items_remove: function (frm, cdt, cdn) {},
    items_remove: function (frm, cdt, cdn) {
        // es-GT: Este disparador corre al momento de eliminar una nueva fila.
        // en-US: This trigger runs when removing a row.
        // Vuelve a calcular los totales de FUEL, GOODS, SERVICES e IVA cuando se elimina una fila.
        fix_gt_tax_fuel = 0;
        fix_gt_tax_goods = 0;
        fix_gt_tax_services = 0;
        fix_gt_tax_iva = 0;

        $.each(frm.doc.items || [], function (i, d) {
            fix_gt_tax_fuel += flt(d.facelec_qt_gt_tax_net_fuel_amt);
            fix_gt_tax_goods += flt(d.facelec_qt_gt_tax_net_goods_amt);
            fix_gt_tax_services += flt(d.facelec_qt_gt_tax_net_services_amt);
            fix_gt_tax_iva += flt(d.facelec_qt_sales_tax_for_this_row);
        });

        cur_frm.set_value("facelec_qt_gt_tax_fuel", fix_gt_tax_fuel);
        cur_frm.set_value("facelec_qt_gt_tax_goods", fix_gt_tax_goods);
        cur_frm.set_value("facelec_qt_gt_tax_services", fix_gt_tax_services);
        cur_frm.set_value("facelec_qt_total_iva", fix_gt_tax_iva);
    },
    item_code: function (frm, cdt, cdn) {
        // Trigger codigo de producto
        this_company_sales_tax_var = cur_frm.doc.taxes[0].rate;
        console.log("If you can see this, tax rate variable now exists, and its set to: " + this_company_sales_tax_var);
        refresh_field('qty');
    },
    qty: function (frm, cdt, cdn) {
        // Trigger cantidad
        shs_quotation_calculation(frm, cdt, cdn);
        console.log("cdt contains: " + cdt);
        console.log("cdn contains: " + cdn);
    },
    uom: function (frm, cdt, cdn) {
        // Trigger UOM
        console.log("The unit of measure field was changed and the code from the trigger was run");
    },
    conversion_factor: function (frm, cdt, cdn) {
        // Trigger factor de conversion
        console.log("El disparador de factor de conversión se corrió.");
        shs_quotation_calculation(frm, cdt, cdn);
    },
    facelec_qt_tax_rate_per_uom_account: function (frm, cdt, cdn) {
        // Eleccion de este trigger para la adicion de filas en taxes con sus respectivos valores.
        frm.doc.items.forEach((item_row_i, index_i) => {
            if (item_row_i.name == cdn) {
                var cuenta = item_row_i.facelec_qt_tax_rate_per_uom_account;
                if (cuenta !== null) {
                    if (buscar_account(frm, cuenta)) {
                        console.log('La cuenta de impuestos y cargos ya existe en la tabla Taxes and Charges');
                    } else {
                        console.log('La cuenta no existe, se agregara una nueva fila en taxes');
                        frappe.model.add_child(frm.doc, "Sales Taxes and Charges", "taxes");
                        frm.doc.taxes.forEach((item_row, index) => {
                            if (item_row.account_head == undefined) {
                                frappe.call({
                                    method: "factura_electronica.api.get_data_tax_account",
                                    args: {
                                        name_account_tax_gt: cuenta
                                    },
                                    // El callback recibe como parametro el dato retornado por script python del lado del servidor
                                    callback: function (data) {
                                        // Asigna los valores retornados del servidor
                                        frm.doc.taxes[index].charge_type = 'On Net Total'; // Opcion 1: Actual, Opcion 2: On Net Total, Opcion 3: On Previous Row Amount, Opcion 4: On Previous Row Total
                                        frm.doc.taxes[index].account_head = cuenta;
                                        frm.doc.taxes[index].rate = data.message;
                                        //item_row.account_head = cuenta;
                                        //refresh_field("taxes");
                                        frm.doc.taxes[index].description = 'Impuesto';
                                    }
                                });
                            }
                        });
                    }
                } else {
                    console.log('El producto seleccionado no tiene una cuenta asociada')
                }
            }
        });
    },
    rate: function (frm, cdt, cdn) {
        shs_quotation_calculation(frm, cdt, cdn);
    }
});
/*	2.6 en-US: Triggers for Quotation Item END ---------------------------------------*/
/*	2.6 es-GT: Disparadores para Producto de Cotización TERMINA  ---------------------*/

/*	2.7 en-US: Triggers for Purchase Order BEGIN -------------------------------------*/
/*	2.7 es-GT: Disparadores para Orden de Compra EMPIEZA  ----------------------------*/
frappe.ui.form.on("Purchase Order", {
    refresh: function (frm, cdt, cdn) {
        // Trigger refresh de pagina
        console.log('Exito Script In Purchase Order');
        // Boton para recalcular
        frm.add_custom_button("UOM Recalculation", function () {
            frm.doc.items.forEach((item) => {
                // for each button press each line is being processed.
                console.log("item contains: " + item);
                //Importante
                shs_purchase_order_calculation(frm, "Purchase Order Item", item.name);
            });
        });
    },
    facelec_po_nit: function (frm, cdt, cdn) {
        // Funcion para validar NIT: Se ejecuta cuando exista un cambio en el campo de NIT
        valNit(frm.doc.facelec_po_nit, frm.doc.supplier, frm);
    },
    discount_amount: function (frm, cdt, cdn) {
        // Trigger Monto de descuento
        tax_before_calc = frm.doc.facelec_po_total_iva;
        console.log("El descuento total es:" + frm.doc.discount_amount);
        console.log("El IVA calculado anteriormente:" + frm.doc.facelec_po_total_iva);
        discount_amount_net_value = (frm.doc.discount_amount / (1 + (cur_frm.doc.taxes[0].rate / 100)));
        console.log("El neto sin iva del descuento es" + discount_amount_net_value);
        discount_amount_tax_value = (discount_amount_net_value * (cur_frm.doc.taxes[0].rate / 100));
        console.log("El IVA del descuento es:" + discount_amount_tax_value);
        frm.doc.facelec_po_total_iva = (frm.doc.facelec_po_total_iva - discount_amount_tax_value);
        console.log("El IVA ya sin el iva del descuento es ahora:" + frm.doc.facelec_po_total_iva);
    },
    supplier: function (frm, cdt, cdn) {
        // Trigger Proveedor
        this_company_sales_tax_var = cur_frm.doc.taxes[0].rate;
        console.log('Corrio supplier trigger y se cargo el IVA, el cual es ' + this_company_sales_tax_var);
    },
    before_save: function (frm, cdt, cdn) {
        // Trigger antes de guardar
        frm.doc.items.forEach((item) => {
            // for each button press each line is being processed.
            console.log("item contains: " + item);
            //Importante
            shs_purchase_order_calculation(frm, "Purchase Order Item", item.name);
            tax_before_calc = frm.doc.facelec_po_total_iva;
            console.log("El descuento total es:" + frm.doc.discount_amount);
            console.log("El IVA calculado anteriormente:" + frm.doc.facelec_po_total_iva);
            discount_amount_net_value = (frm.doc.discount_amount / (1 + (cur_frm.doc.taxes[0].rate / 100)));
            console.log("El neto sin iva del descuento es" + discount_amount_net_value);
            discount_amount_tax_value = (discount_amount_net_value * (cur_frm.doc.taxes[0].rate / 100));
            console.log("El IVA del descuento es:" + discount_amount_tax_value);
            frm.doc.facelec_po_total_iva = (frm.doc.facelec_po_total_iva - discount_amount_tax_value);
            console.log("El IVA ya sin el iva del descuento es ahora:" + frm.doc.facelec_po_total_iva);
        });
    },
});
/*	2.7 en-US: Triggers for Purchase Order END ---------------------------------------*/
/*	2.7 es-GT: Disparadores para Orden de Compra TERMINA  ----------------------------*/

/*	2.8 en-US: Triggers for Purchase Order Items BEGIN -------------------------------*/
/*	2.8 es-GT: Disparadores para Productos de Orden de Compra EMPIEZA ----------------*/
frappe.ui.form.on("Purchase Order Item", {
    items_add: function (frm, cdt, cdn) {},
    items_move: function (frm, cdt, cdn) {},
    before_items_remove: function (frm, cdt, cdn) {},
    items_remove: function (frm, cdt, cdn) {
        // es-GT: Este disparador corre al momento de eliminar una nueva fila.
        // en-US: This trigger runs when removing a row.
        // Vuelve a calcular los totales de FUEL, GOODS, SERVICES e IVA cuando se elimina una fila.
        fix_gt_tax_fuel = 0;
        fix_gt_tax_goods = 0;
        fix_gt_tax_services = 0;
        fix_gt_tax_iva = 0;

        $.each(frm.doc.items || [], function (i, d) {
            fix_gt_tax_fuel += flt(d.facelec_po_gt_tax_net_fuel_amt);
            fix_gt_tax_goods += flt(d.facelec_po_gt_tax_net_goods_amt);
            fix_gt_tax_services += flt(d.facelec_po_gt_tax_net_services_amt);
            fix_gt_tax_iva += flt(d.facelec_po_sales_tax_for_this_row);
        });

        cur_frm.set_value("facelec_po_gt_tax_fuel", fix_gt_tax_fuel);
        cur_frm.set_value("facelec_po_gt_tax_goods", fix_gt_tax_goods);
        cur_frm.set_value("facelec_po_gt_tax_services", fix_gt_tax_services);
        cur_frm.set_value("facelec_po_total_iva", fix_gt_tax_iva);
    },
    item_code: function (frm, cdt, cdn) {
        // Trigger codigo de producto
        this_company_sales_tax_var = cur_frm.doc.taxes[0].rate;
        console.log("If you can see this, tax rate variable now exists, and its set to: " + this_company_sales_tax_var);
        refresh_field('qty');
    },
    qty: function (frm, cdt, cdn) {
        // Trigger cantidad
        shs_purchase_order_calculation(frm, cdt, cdn);
        console.log("cdt contains: " + cdt);
        console.log("cdn contains: " + cdn);
    },
    uom: function (frm, cdt, cdn) {
        // Trigger UOM
        console.log("The unit of measure field was changed and the code from the trigger was run");
    },
    conversion_factor: function (frm, cdt, cdn) {
        // Trigger factor de conversion
        console.log("El disparador de factor de conversión se corrió.");
        shs_purchase_order_calculation(frm, cdt, cdn);
    },
    facelec_po_tax_rate_per_uom_account: function (frm, cdt, cdn) {
        // Eleccion de este trigger para la adicion de filas en taxes con sus respectivos valores.
        frm.doc.items.forEach((item_row_i, index_i) => {
            if (item_row_i.name == cdn) {
                var cuenta = item_row_i.facelec_po_tax_rate_per_uom_account;
                if (cuenta !== null) {
                    if (buscar_account(frm, cuenta)) {
                        console.log('La cuenta de impuestos y cargos ya existe en la tabla Taxes and Charges');
                    } else {
                        console.log('La cuenta no existe, se agregara una nueva fila en taxes');
                        frappe.model.add_child(frm.doc, "Sales Taxes and Charges", "taxes");
                        frm.doc.taxes.forEach((item_row, index) => {
                            if (item_row.account_head == undefined) {
                                frappe.call({
                                    method: "factura_electronica.api.get_data_tax_account",
                                    args: {
                                        name_account_tax_gt: cuenta
                                    },
                                    // El callback recibe como parametro el dato retornado por script python del lado del servidor
                                    callback: function (data) {
                                        // Asigna los valores retornados del servidor
                                        frm.doc.taxes[index].charge_type = 'On Net Total'; // Opcion 1: Actual, Opcion 2: On Net Total, Opcion 3: On Previous Row Amount, Opcion 4: On Previous Row Total
                                        frm.doc.taxes[index].account_head = cuenta;
                                        frm.doc.taxes[index].rate = data.message;
                                        //item_row.account_head = cuenta;
                                        //refresh_field("taxes");
                                        frm.doc.taxes[index].description = 'Impuesto';
                                    }
                                });
                            }
                        });
                    }
                } else {
                    console.log('El producto seleccionado no tiene una cuenta asociada');
                }
            }
        });
    },
    rate: function (frm, cdt, cdn) {
        shs_purchase_order_calculation(frm, cdt, cdn);
    }
});
/*	2.8 en-US: Triggers for Purchase Order Items END ---------------------------------*/
/*	2.8 es-GT: Disparadores para Productos de Orden de Compra TERMINA ----------------*/

/*	2.9 en-US: Triggers for Purchase Receipt BEGIN -----------------------------------*/
/*	2.9 es-GT: Disparadores para Recibo de Compra EMPIEZA ----------------------------*/
frappe.ui.form.on("Purchase Receipt", {
    refresh: function (frm, cdt, cdn) {
        // Trigger refresh de pagina
        console.log('Exito Script In Purchase Receipt');
        // Boton para recalcular
        frm.add_custom_button("UOM Recalculation", function () {
            frm.doc.items.forEach((item) => {
                // for each button press each line is being processed.
                console.log("item contains: " + item);
                //Importante
                shs_purchase_receipt_calculation(frm, "Purchase Receipt Item", item.name);
            });
        });
    },
    facelec_nit_prproveedor: function (frm, cdt, cdn) {
        // Funcion para validar NIT: Se ejecuta cuando exista un cambio en el campo de NIT
        valNit(frm.doc.facelec_nit_prproveedor, frm.doc.supplier, frm);
    },
    discount_amount: function (frm, cdt, cdn) {
        // Trigger Monto de descuento
        tax_before_calc = frm.doc.facelec_pr_total_iva;
        console.log("El descuento total es:" + frm.doc.discount_amount);
        console.log("El IVA calculado anteriormente:" + frm.doc.facelec_pr_total_iva);
        discount_amount_net_value = (frm.doc.discount_amount / (1 + (cur_frm.doc.taxes[0].rate / 100)));
        console.log("El neto sin iva del descuento es" + discount_amount_net_value);
        discount_amount_tax_value = (discount_amount_net_value * (cur_frm.doc.taxes[0].rate / 100));
        console.log("El IVA del descuento es:" + discount_amount_tax_value);
        frm.doc.facelec_pr_total_iva = (frm.doc.facelec_pr_total_iva - discount_amount_tax_value);
        console.log("El IVA ya sin el iva del descuento es ahora:" + frm.doc.facelec_pr_total_iva);
    },
    supplier: function (frm, cdt, cdn) {
        // Trigger Proveedor
        this_company_sales_tax_var = cur_frm.doc.taxes[0].rate;
        console.log('Corrio supplier trigger y se cargo el IVA, el cual es ' + this_company_sales_tax_var);
    },
    before_save: function (frm, cdt, cdn) {
        // Trigger antes de guardar
        frm.doc.items.forEach((item) => {
            // for each button press each line is being processed.
            console.log("item contains: " + item);
            //Importante
            shs_purchase_receipt_calculation(frm, "Purchase Receipt Item", item.name);
            tax_before_calc = frm.doc.facelec_pr_total_iva;
            console.log("El descuento total es:" + frm.doc.discount_amount);
            console.log("El IVA calculado anteriormente:" + frm.doc.facelec_pr_total_iva);
            discount_amount_net_value = (frm.doc.discount_amount / (1 + (cur_frm.doc.taxes[0].rate / 100)));
            console.log("El neto sin iva del descuento es" + discount_amount_net_value);
            discount_amount_tax_value = (discount_amount_net_value * (cur_frm.doc.taxes[0].rate / 100));
            console.log("El IVA del descuento es:" + discount_amount_tax_value);
            frm.doc.facelec_pr_total_iva = (frm.doc.facelec_pr_total_iva - discount_amount_tax_value);
            console.log("El IVA ya sin el iva del descuento es ahora:" + frm.doc.facelec_pr_total_iva);
        });
    },
});
/*	2.9 en-US: Triggers for Purchase Receipt END -------------------------------------*/
/*	2.9 es-GT: Disparadores para Recibo de Compra TERMINA ----------------------------*/

/*	2.10 en-US: Triggers for Purchase Receipt Item BEGIN -----------------------------*/
/*	2.10 es-GT: Disparadores para Productos de Recibo de Compra EMPIEZA --------------*/
frappe.ui.form.on("Purchase Receipt Item", {
    items_add: function (frm, cdt, cdn) {},
    items_move: function (frm, cdt, cdn) {},
    before_items_remove: function (frm, cdt, cdn) {},
    items_remove: function (frm, cdt, cdn) {
        // es-GT: Este disparador corre al momento de eliminar una nueva fila.
        // en-US: This trigger runs when removing a row.
        // Vuelve a calcular los totales de FUEL, GOODS, SERVICES e IVA cuando se elimina una fila.
        fix_gt_tax_fuel = 0;
        fix_gt_tax_goods = 0;
        fix_gt_tax_services = 0;
        fix_gt_tax_iva = 0;

        $.each(frm.doc.items || [], function (i, d) {
            fix_gt_tax_fuel += flt(d.facelec_pr_gt_tax_net_fuel_amt);
            fix_gt_tax_goods += flt(d.facelec_pr_gt_tax_net_goods_amt);
            fix_gt_tax_services += flt(d.facelec_pr_gt_tax_net_services_amt);
            fix_gt_tax_iva += flt(d.facelec_pr_sales_tax_for_this_row);
        });

        cur_frm.set_value("facelec_pr_gt_tax_fuel", fix_gt_tax_fuel);
        cur_frm.set_value("facelec_pr_gt_tax_goods", fix_gt_tax_goods);
        cur_frm.set_value("facelec_pr_gt_tax_services", fix_gt_tax_services);
        cur_frm.set_value("facelec_pr_total_iva", fix_gt_tax_iva);
    },
    item_code: function (frm, cdt, cdn) {
        // Trigger codigo de producto
        this_company_sales_tax_var = cur_frm.doc.taxes[0].rate;
        console.log("If you can see this, tax rate variable now exists, and its set to: " + this_company_sales_tax_var);
        refresh_field('qty');
    },
    qty: function (frm, cdt, cdn) {
        // Trigger cantidad
        shs_purchase_receipt_calculation(frm, cdt, cdn);
        console.log("cdt contains: " + cdt);
        console.log("cdn contains: " + cdn);
    },
    uom: function (frm, cdt, cdn) {
        // Trigger UOM
        console.log("The unit of measure field was changed and the code from the trigger was run");
    },
    conversion_factor: function (frm, cdt, cdn) {
        // Trigger factor de conversion
        console.log("El disparador de factor de conversión se corrió.");
        shs_purchase_order_calculation(frm, cdt, cdn);
    },
    facelec_pr_tax_rate_per_uom_account: function (frm, cdt, cdn) {
        // Eleccion de este trigger para la adicion de filas en taxes con sus respectivos valores.
        frm.doc.items.forEach((item_row_i, index_i) => {
            if (item_row_i.name == cdn) {
                var cuenta = item_row_i.facelec_pr_tax_rate_per_uom_account;
                if (cuenta !== null) {
                    if (buscar_account(frm, cuenta)) {
                        console.log('La cuenta de impuestos y cargos ya existe en la tabla Taxes and Charges');
                    } else {
                        console.log('La cuenta no existe, se agregara una nueva fila en taxes');
                        frappe.model.add_child(frm.doc, "Sales Taxes and Charges", "taxes");
                        frm.doc.taxes.forEach((item_row, index) => {
                            if (item_row.account_head == undefined) {
                                frappe.call({
                                    method: "factura_electronica.api.get_data_tax_account",
                                    args: {
                                        name_account_tax_gt: cuenta
                                    },
                                    // El callback recibe como parametro el dato retornado por script python del lado del servidor
                                    callback: function (data) {
                                        // Asigna los valores retornados del servidor
                                        frm.doc.taxes[index].charge_type = 'On Net Total'; // Opcion 1: Actual, Opcion 2: On Net Total, Opcion 3: On Previous Row Amount, Opcion 4: On Previous Row Total
                                        frm.doc.taxes[index].account_head = cuenta;
                                        frm.doc.taxes[index].rate = data.message;
                                        //item_row.account_head = cuenta;
                                        //refresh_field("taxes");
                                        frm.doc.taxes[index].description = 'Impuesto';
                                    }
                                });
                            }
                        });
                    }
                } else {
                    console.log('El producto seleccionado no tiene una cuenta asociada');
                }
            }
        });
    },
    rate: function (frm, cdt, cdn) {
        shs_purchase_receipt_calculation(frm, cdt, cdn);
    }
});
/*	2.10 en-US: Triggers for Purchase Receipt Item END -------------------------------*/
/*	2.10 es-GT: Disparadores para Productos de Recibo de Compra TERMINA --------------*/

/*	2.11 en-US: Triggers for Sales Order BEGIN ---------------------------------------*/
/*	2.11 es-GT: Disparadores para Orden de Venta EMPIEZA -----------------------------*/
frappe.ui.form.on("Sales Order", {
    refresh: function (frm, cdt, cdn) {
        // Trigger refresh de pagina
        console.log('Exito Script In Sales Order');
        // Boton para recalcular
        frm.add_custom_button("UOM Recalculation", function () {
            frm.doc.items.forEach((item) => {
                // for each button press each line is being processed.
                console.log("item contains: " + item);
                //Importante
                shs_sales_order_calculation(frm, "Sales Order Item", item.name);
            });
        });
    },
    shs_so_nit: function (frm, cdt, cdn) {
        // Funcion para validar NIT: Se ejecuta cuando exista un cambio en el campo de NIT
        valNit(frm.doc.shs_so_nit, frm.doc.customer, frm);
    },
    discount_amount: function (frm, cdt, cdn) {
        // Trigger Monto de descuento
        tax_before_calc = frm.doc.shs_so_total_iva;
        console.log("El descuento total es:" + frm.doc.discount_amount);
        console.log("El IVA calculado anteriormente:" + frm.doc.shs_so_total_iva);
        discount_amount_net_value = (frm.doc.discount_amount / (1 + (cur_frm.doc.taxes[0].rate / 100)));
        console.log("El neto sin iva del descuento es" + discount_amount_net_value);
        discount_amount_tax_value = (discount_amount_net_value * (cur_frm.doc.taxes[0].rate / 100));
        console.log("El IVA del descuento es:" + discount_amount_tax_value);
        frm.doc.shs_so_total_iva = (frm.doc.shs_so_total_iva - discount_amount_tax_value);
        console.log("El IVA ya sin el iva del descuento es ahora:" + frm.doc.shs_so_total_iva);
    },
    customer: function (frm, cdt, cdn) {
        // Trigger Proveedor
        this_company_sales_tax_var = cur_frm.doc.taxes[0].rate;
        console.log('Corrio supplier trigger y se cargo el IVA, el cual es ' + this_company_sales_tax_var);
    },
    before_save: function (frm, cdt, cdn) {
        // Trigger antes de guardar
        frm.doc.items.forEach((item) => {
            // for each button press each line is being processed.
            console.log("item contains: " + item);
            //Importante
            shs_sales_order_calculation(frm, "Sales Order Item", item.name);
            tax_before_calc = frm.doc.shs_so_total_iva;
            console.log("El descuento total es:" + frm.doc.discount_amount);
            console.log("El IVA calculado anteriormente:" + frm.doc.shs_so_total_iva);
            discount_amount_net_value = (frm.doc.discount_amount / (1 + (cur_frm.doc.taxes[0].rate / 100)));
            console.log("El neto sin iva del descuento es" + discount_amount_net_value);
            discount_amount_tax_value = (discount_amount_net_value * (cur_frm.doc.taxes[0].rate / 100));
            console.log("El IVA del descuento es:" + discount_amount_tax_value);
            frm.doc.shs_so_total_iva = (frm.doc.shs_so_total_iva - discount_amount_tax_value);
            console.log("El IVA ya sin el iva del descuento es ahora:" + frm.doc.shs_so_total_iva);
        });
    },
});
/*	2.11 en-US: Triggers for Sales Order END -----------------------------------------*/
/*	2.11 es-GT: Disparadores para Orden de Venta TERMINA -----------------------------*/

/*	2.12 en-US: Triggers for Sales Order Item BEGIN ----------------------------------*/
/*	2.12 es-GT: Disparadores para Productos de Orden de Venta EMPIEZA ----------------*/
frappe.ui.form.on("Sales Order Item", {
    items_add: function (frm, cdt, cdn) {},
    items_move: function (frm, cdt, cdn) {},
    before_items_remove: function (frm, cdt, cdn) {},
    items_remove: function (frm, cdt, cdn) {
        // es-GT: Este disparador corre al momento de eliminar una nueva fila.
        // en-US: This trigger runs when removing a row.
        // Vuelve a calcular los totales de FUEL, GOODS, SERVICES e IVA cuando se elimina una fila.
        fix_gt_tax_fuel = 0;
        fix_gt_tax_goods = 0;
        fix_gt_tax_services = 0;
        fix_gt_tax_iva = 0;

        $.each(frm.doc.items || [], function (i, d) {
            fix_gt_tax_fuel += flt(d.shs_so_gt_tax_net_fuel_amt);
            fix_gt_tax_goods += flt(d.shs_so_gt_tax_net_goods_amt);
            fix_gt_tax_services += flt(d.shs_so_gt_tax_net_services_amt);
            fix_gt_tax_iva += flt(d.shs_so_sales_tax_for_this_row);
        });

        cur_frm.set_value("shs_gt_tax_fuel", fix_gt_tax_fuel);
        cur_frm.set_value("shs_so_gt_tax_goods", fix_gt_tax_goods);
        cur_frm.set_value("shs_so_gt_tax_services", fix_gt_tax_services);
        cur_frm.set_value("shs_so_total_iva", fix_gt_tax_iva);
    },
    item_code: function (frm, cdt, cdn) {
        // Trigger codigo de producto
        this_company_sales_tax_var = cur_frm.doc.taxes[0].rate;
        console.log("If you can see this, tax rate variable now exists, and its set to: " + this_company_sales_tax_var);
        refresh_field('qty');
    },
    qty: function (frm, cdt, cdn) {
        // Trigger cantidad
        shs_sales_order_calculation(frm, cdt, cdn);
        console.log("cdt contains: " + cdt);
        console.log("cdn contains: " + cdn);
    },
    uom: function (frm, cdt, cdn) {
        // Trigger UOM
        console.log("The unit of measure field was changed and the code from the trigger was run");
    },
    conversion_factor: function (frm, cdt, cdn) {
        // Trigger factor de conversion
        console.log("El disparador de factor de conversión se corrió.");
        shs_sales_order_calculation(frm, cdt, cdn);
    },
    shs_so_tax_rate_per_uom_account: function (frm, cdt, cdn) {
        // Eleccion de este trigger para la adicion de filas en taxes con sus respectivos valores.
        frm.doc.items.forEach((item_row_i, index_i) => {
            if (item_row_i.name == cdn) {
                var cuenta = item_row_i.shs_so_tax_rate_per_uom_account;
                if (cuenta !== null) {
                    if (buscar_account(frm, cuenta)) {
                        console.log('La cuenta de impuestos y cargos ya existe en la tabla Taxes and Charges');
                    } else {
                        console.log('La cuenta no existe, se agregara una nueva fila en taxes');
                        frappe.model.add_child(frm.doc, "Sales Taxes and Charges", "taxes");
                        frm.doc.taxes.forEach((item_row, index) => {
                            if (item_row.account_head == undefined) {
                                frappe.call({
                                    method: "factura_electronica.api.get_data_tax_account",
                                    args: {
                                        name_account_tax_gt: cuenta
                                    },
                                    // El callback recibe como parametro el dato retornado por script python del lado del servidor
                                    callback: function (data) {
                                        // Asigna los valores retornados del servidor
                                        frm.doc.taxes[index].charge_type = 'On Net Total'; // Opcion 1: Actual, Opcion 2: On Net Total, Opcion 3: On Previous Row Amount, Opcion 4: On Previous Row Total
                                        frm.doc.taxes[index].account_head = cuenta;
                                        frm.doc.taxes[index].rate = data.message;
                                        //item_row.account_head = cuenta;
                                        //refresh_field("taxes");
                                        frm.doc.taxes[index].description = 'Impuesto';
                                    }
                                });
                            }
                        });
                    }
                } else {
                    console.log('El producto seleccionado no tiene una cuenta asociada');
                }
            }
        });
    },
    rate: function (frm, cdt, cdn) {
        shs_sales_order_calculation(frm, cdt, cdn);
    }
});
/*	2.12 en-US: Triggers for Sales Order Item END ------------------------------------*/
/*	2.12 es-GT: Disparadores para Productos de Orden de Venta TERMINA ----------------*/

/*	2.13 en-US: Triggers for Delivery Note BEGIN -------------------------------------*/
/*	2.13 es-GT: Disparadores para Nota de Entrega EMPIEZA ----------------------------*/
frappe.ui.form.on("Delivery Note", {
    refresh: function (frm, cdt, cdn) {
        // Trigger refresh de pagina
        console.log('Exito Script In Delivery Note');
        // Boton para recalcular
        frm.add_custom_button("UOM Recalculation", function () {
            frm.doc.items.forEach((item) => {
                // for each button press each line is being processed.
                console.log("item contains: " + item);
                //Importante
                shs_delivery_note_calculation(frm, "Delivery Note Item", item.name);
            });
        });
    },
    shs_dn_nit: function (frm, cdt, cdn) {
        // Funcion para validar NIT: Se ejecuta cuando exista un cambio en el campo de NIT
        valNit(frm.doc.shs_dn_nit, frm.doc.customer, frm);
    },
    discount_amount: function (frm, cdt, cdn) {
        // Trigger Monto de descuento
        tax_before_calc = frm.doc.shs_dn_total_iva;
        console.log("El descuento total es:" + frm.doc.discount_amount);
        console.log("El IVA calculado anteriormente:" + frm.doc.shs_dn_total_iva);
        discount_amount_net_value = (frm.doc.discount_amount / (1 + (cur_frm.doc.taxes[0].rate / 100)));
        console.log("El neto sin iva del descuento es" + discount_amount_net_value);
        discount_amount_tax_value = (discount_amount_net_value * (cur_frm.doc.taxes[0].rate / 100));
        console.log("El IVA del descuento es:" + discount_amount_tax_value);
        frm.doc.shs_dn_total_iva = (frm.doc.shs_dn_total_iva - discount_amount_tax_value);
        console.log("El IVA ya sin el iva del descuento es ahora:" + frm.doc.shs_dn_total_iva);
    },
    customer: function (frm, cdt, cdn) {
        // Trigger Proveedor
        this_company_sales_tax_var = cur_frm.doc.taxes[0].rate;
        console.log('Corrio customer trigger y se cargo el IVA, el cual es ' + this_company_sales_tax_var);
    },
    before_save: function (frm, cdt, cdn) {
        // Trigger antes de guardar
        frm.doc.items.forEach((item) => {
            // for each button press each line is being processed.
            console.log("item contains: " + item);
            //Importante
            shs_delivery_note_calculation(frm, "Delivery Note Item", item.name);
            tax_before_calc = frm.doc.shs_dn_total_iva;
            console.log("El descuento total es:" + frm.doc.discount_amount);
            console.log("El IVA calculado anteriormente:" + frm.doc.shs_dn_total_iva);
            discount_amount_net_value = (frm.doc.discount_amount / (1 + (cur_frm.doc.taxes[0].rate / 100)));
            console.log("El neto sin iva del descuento es" + discount_amount_net_value);
            discount_amount_tax_value = (discount_amount_net_value * (cur_frm.doc.taxes[0].rate / 100));
            console.log("El IVA del descuento es:" + discount_amount_tax_value);
            frm.doc.shs_dn_total_iva = (frm.doc.shs_dn_total_iva - discount_amount_tax_value);
            console.log("El IVA ya sin el iva del descuento es ahora:" + frm.doc.shs_dn_total_iva);
        });
    },
});
/*	2.13 en-US: Triggers for Delivery Note END ---------------------------------------*/
/*	2.13 es-GT: Disparadores para Nota de Entrega TERMINA ----------------------------*/

/*	2.14 en-US: Triggers for Delivery Note Item BEGIN --------------------------------*/
/*	2.14 es-GT: Disparadores para Producto de Nota de Entrega EMPIEZA ----------------*/
frappe.ui.form.on("Delivery Note Item", {
    items_add: function (frm, cdt, cdn) {},
    items_move: function (frm, cdt, cdn) {},
    before_items_remove: function (frm, cdt, cdn) {},
    items_remove: function (frm, cdt, cdn) {
        // es-GT: Este disparador corre al momento de eliminar una nueva fila.
        // en-US: This trigger runs when removing a row.
        // Vuelve a calcular los totales de FUEL, GOODS, SERVICES e IVA cuando se elimina una fila.
        fix_gt_tax_fuel = 0;
        fix_gt_tax_goods = 0;
        fix_gt_tax_services = 0;
        fix_gt_tax_iva = 0;

        $.each(frm.doc.items || [], function (i, d) {
            fix_gt_tax_fuel += flt(d.shs_dn_gt_tax_net_fuel_amt);
            fix_gt_tax_goods += flt(d.shs_dn_gt_tax_net_goods_amt);
            fix_gt_tax_services += flt(d.shs_dn_gt_tax_net_services_amt);
            fix_gt_tax_iva += flt(d.shs_dn_sales_tax_for_this_row);
        });

        cur_frm.set_value("shs_dn_gt_tax_fuel", fix_gt_tax_fuel);
        cur_frm.set_value("shs_dn_gt_tax_goods", fix_gt_tax_goods);
        cur_frm.set_value("shs_dn_gt_tax_services", fix_gt_tax_services);
        cur_frm.set_value("shs_dn_total_iva", fix_gt_tax_iva);
    },
    item_code: function (frm, cdt, cdn) {
        // Trigger codigo de producto
        this_company_sales_tax_var = cur_frm.doc.taxes[0].rate;
        console.log("If you can see this, tax rate variable now exists, and its set to: " + this_company_sales_tax_var);
        refresh_field('qty');
    },
    qty: function (frm, cdt, cdn) {
        // Trigger cantidad
        shs_delivery_note_calculation(frm, cdt, cdn);
        console.log("cdt contains: " + cdt);
        console.log("cdn contains: " + cdn);
    },
    uom: function (frm, cdt, cdn) {
        // Trigger UOM
        console.log("The unit of measure field was changed and the code from the trigger was run");
    },
    conversion_factor: function (frm, cdt, cdn) {
        // Trigger factor de conversion
        console.log("El disparador de factor de conversión se corrió.");
        shs_delivery_note_calculation(frm, cdt, cdn);
    },
    shs_dn_tax_rate_per_uom_account: function (frm, cdt, cdn) {
        // Eleccion de este trigger para la adicion de filas en taxes con sus respectivos valores.
        frm.doc.items.forEach((item_row_i, index_i) => {
            if (item_row_i.name == cdn) {
                var cuenta = item_row_i.shs_dn_tax_rate_per_uom_account;
                if (cuenta !== null) {
                    if (buscar_account(frm, cuenta)) {
                        console.log('La cuenta de impuestos y cargos ya existe en la tabla Taxes and Charges');
                    } else {
                        console.log('La cuenta no existe, se agregara una nueva fila en taxes');
                        frappe.model.add_child(frm.doc, "Sales Taxes and Charges", "taxes");
                        frm.doc.taxes.forEach((item_row, index) => {
                            if (item_row.account_head == undefined) {
                                frappe.call({
                                    method: "factura_electronica.api.get_data_tax_account",
                                    args: {
                                        name_account_tax_gt: cuenta
                                    },
                                    // El callback recibe como parametro el dato retornado por script python del lado del servidor
                                    callback: function (data) {
                                        // Asigna los valores retornados del servidor
                                        frm.doc.taxes[index].charge_type = 'On Net Total'; // Opcion 1: Actual, Opcion 2: On Net Total, Opcion 3: On Previous Row Amount, Opcion 4: On Previous Row Total
                                        frm.doc.taxes[index].account_head = cuenta;
                                        frm.doc.taxes[index].rate = data.message;
                                        //item_row.account_head = cuenta;
                                        //refresh_field("taxes");
                                        frm.doc.taxes[index].description = 'Impuesto';
                                    }
                                });
                            }
                        });
                    }
                } else {
                    console.log('El producto seleccionado no tiene una cuenta asociada');
                }
            }
        });
    },
    rate: function (frm, cdt, cdn) {
        shs_delivery_note_calculation(frm, cdt, cdn);
    }
});
/*	2.14 en-US: Triggers for Delivery Note Item END ----------------------------------*/
/*	2.14 es-GT: Disparadores para Producto de Nota de Entrega TERMINA ----------------*/

/*	2.15 en-US: Triggers for Supplier Quotation BEGIN --------------------------------*/
/*	2.15 es-GT: Disparadores para Presupuesto de Proveedor EMPIEZA -------------------*/
frappe.ui.form.on("Supplier Quotation", {
    refresh: function (frm, cdt, cdn) {
        // Trigger refresh de pagina
        console.log('Exito Script In Supplier Quotation');
        // Boton para recalcular
        frm.add_custom_button("UOM Recalculation", function () {
            frm.doc.items.forEach((item) => {
                // for each button press each line is being processed.
                console.log("item contains: " + item);
                //Importante
                shs_supplier_quotation_calculation(frm, "Supplier Quotation Item", item.name);
            });
        });
    },
    shs_spq_nit: function (frm, cdt, cdn) {
        // Funcion para validar NIT: Se ejecuta cuando exista un cambio en el campo de NIT
        valNit(frm.doc.shs_spq_nit, frm.doc.supplier, frm);
    },
    discount_amount: function (frm, cdt, cdn) {
        // Trigger Monto de descuento
        tax_before_calc = frm.doc.shs_spq_total_iva;
        console.log("El descuento total es:" + frm.doc.discount_amount);
        console.log("El IVA calculado anteriormente:" + frm.doc.shs_spq_total_iva);
        discount_amount_net_value = (frm.doc.discount_amount / (1 + (cur_frm.doc.taxes[0].rate / 100)));
        console.log("El neto sin iva del descuento es" + discount_amount_net_value);
        discount_amount_tax_value = (discount_amount_net_value * (cur_frm.doc.taxes[0].rate / 100));
        console.log("El IVA del descuento es:" + discount_amount_tax_value);
        frm.doc.shs_spq_total_iva = (frm.doc.shs_spq_total_iva - discount_amount_tax_value);
        console.log("El IVA ya sin el iva del descuento es ahora:" + frm.doc.shs_spq_total_iva);
    },
    supplier: function (frm, cdt, cdn) {
        // Trigger Proveedor
        this_company_sales_tax_var = cur_frm.doc.taxes[0].rate;
        console.log('Corrio customer trigger y se cargo el IVA, el cual es ' + this_company_sales_tax_var);
    },
    before_save: function (frm, cdt, cdn) {
        // Trigger antes de guardar
        frm.doc.items.forEach((item) => {
            // for each button press each line is being processed.
            console.log("item contains: " + item);
            //Importante
            shs_supplier_quotation_calculation(frm, "Supplier Quotation Item", item.name);
            tax_before_calc = frm.doc.shs_spq_total_iva;
            console.log("El descuento total es:" + frm.doc.discount_amount);
            console.log("El IVA calculado anteriormente:" + frm.doc.shs_spq_total_iva);
            discount_amount_net_value = (frm.doc.discount_amount / (1 + (cur_frm.doc.taxes[0].rate / 100)));
            console.log("El neto sin iva del descuento es" + discount_amount_net_value);
            discount_amount_tax_value = (discount_amount_net_value * (cur_frm.doc.taxes[0].rate / 100));
            console.log("El IVA del descuento es:" + discount_amount_tax_value);
            frm.doc.shs_spq_total_iva = (frm.doc.shs_spq_total_iva - discount_amount_tax_value);
            console.log("El IVA ya sin el iva del descuento es ahora:" + frm.doc.shs_spq_total_iva);
        });
    },
    onload: function (frm, cdt, cdn) {
        // console.log('Funcionando Onload Trigger'); SI FUNCIONA EL TRIGGER
        // Funciona unicamente cuando se carga por primera vez el documento y aplica unicamente para el form y no childtables
    },
});
/*	2.15 en-US: Triggers for Supplier Quotation END ----------------------------------*/
/*	2.15 es-GT: Disparadores para Presupuesto de Proveedor TERMINA -------------------*/

/*	2.16 en-US: Triggers for Supplier Quotation Item BEGIN ---------------------------*/
/*	2.16 es-GT: Disparadores para Producto de Presupuesto de Proveedor EMPIEZA -------*/
frappe.ui.form.on("Supplier Quotation Item", {
    items_add: function (frm, cdt, cdn) {},
    items_move: function (frm, cdt, cdn) {},
    before_items_remove: function (frm, cdt, cdn) {},
    items_remove: function (frm, cdt, cdn) {
        // es-GT: Este disparador corre al momento de eliminar una nueva fila.
        // en-US: This trigger runs when removing a row.
        // Vuelve a calcular los totales de FUEL, GOODS, SERVICES e IVA cuando se elimina una fila.
        fix_gt_tax_fuel = 0;
        fix_gt_tax_goods = 0;
        fix_gt_tax_services = 0;
        fix_gt_tax_iva = 0;

        $.each(frm.doc.items || [], function (i, d) {
            fix_gt_tax_fuel += flt(d.shs_spq_gt_tax_net_fuel_amt);
            fix_gt_tax_goods += flt(d.shs_spq_gt_tax_net_goods_amt);
            fix_gt_tax_services += flt(d.shs_spq_gt_tax_net_services_amt);
            fix_gt_tax_iva += flt(d.shs_spq_sales_tax_for_this_row);
        });

        cur_frm.set_value("shs_spq_gt_tax_fuel", fix_gt_tax_fuel);
        cur_frm.set_value("shs_spq_gt_tax_goods", fix_gt_tax_goods);
        cur_frm.set_value("shs_spq_gt_tax_services", fix_gt_tax_services);
        cur_frm.set_value("shs_spq_total_iva", fix_gt_tax_iva);
    },
    item_code: function (frm, cdt, cdn) {

        // Trigger codigo de producto
        this_company_sales_tax_var = cur_frm.doc.taxes[0].rate;
        console.log("If you can see this, tax rate variable now exists, and its set to: " + this_company_sales_tax_var);
        refresh_field('qty');

    },
    qty: function (frm, cdt, cdn) {
        // Trigger cantidad
        shs_supplier_quotation_calculation(frm, cdt, cdn);
        console.log("cdt contains: " + cdt);
        console.log("cdn contains: " + cdn);
    },
    uom: function (frm, cdt, cdn) {
        // Trigger UOM
        console.log("The unit of measure field was changed and the code from the trigger was run");
    },
    conversion_factor: function (frm, cdt, cdn) {
        // Trigger factor de conversion
        console.log("El disparador de factor de conversión se corrió.");
        shs_supplier_quotation_calculation(frm, cdt, cdn);
    },
    shs_spq_tax_rate_per_uom_account: function (frm, cdt, cdn) {
        // Eleccion de este trigger para la adicion de filas en taxes con sus respectivos valores.
        frm.doc.items.forEach((item_row_i, index_i) => {
            if (item_row_i.name == cdn) {
                var cuenta = item_row_i.shs_spq_tax_rate_per_uom_account;
                if (cuenta !== null) {
                    if (buscar_account(frm, cuenta)) {
                        console.log('La cuenta de impuestos y cargos ya existe en la tabla Taxes and Charges');
                    } else {
                        console.log('La cuenta no existe, se agregara una nueva fila en taxes');
                        frappe.model.add_child(frm.doc, "Sales Taxes and Charges", "taxes");
                        frm.doc.taxes.forEach((item_row, index) => {
                            if (item_row.account_head == undefined) {
                                frappe.call({
                                    method: "factura_electronica.api.get_data_tax_account",
                                    args: {
                                        name_account_tax_gt: cuenta
                                    },
                                    // El callback recibe como parametro el dato retornado por script python del lado del servidor
                                    callback: function (data) {
                                        // Asigna los valores retornados del servidor
                                        frm.doc.taxes[index].charge_type = 'On Net Total'; // Opcion 1: Actual, Opcion 2: On Net Total, Opcion 3: On Previous Row Amount, Opcion 4: On Previous Row Total
                                        frm.doc.taxes[index].account_head = cuenta;
                                        frm.doc.taxes[index].rate = data.message;
                                        //item_row.account_head = cuenta;
                                        //refresh_field("taxes");
                                        frm.doc.taxes[index].description = 'Impuesto';
                                    }
                                });
                            }
                        });
                    }
                } else {
                    console.log('El producto seleccionado no tiene una cuenta asociada');
                }
            }
        });
    },
    rate: function (frm, cdt, cdn) {
        shs_supplier_quotation_calculation(frm, cdt, cdn);
    }
});
/*	2.16 en-US: Triggers for Supplier Quotation Item END -----------------------------*/
/*	2.16 es-GT: Disparadores para Producto de Presupuesto de Proveedor TERMINA -------*/