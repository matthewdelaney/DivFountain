/**
 * Copyright 2011 Matthew Delaney
 * 
 * This file is part of DivFountain.
 *
 * DivFountain is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * DivFountain is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with DivFountain.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * Filename: Field.js
 * Purpose : Creates a grid of div-tags which are then moved by an underlying physical field.
 *           High-pressure regions are created when the user moves their mouse-pointer over one of the
 *           div-tags.
 * 
 * 			 The fluid model used is a version of Glen Murphy's but simplified for squeezing extra speed out of JavaScript engines.
 * Date    : 1/7/2011
 * @author Matthew Delaney
 */
function Field(fSX, fSY, fL, fR, sW, sH, nSX, nSY)
{
	var field;
	var tempField;
	var divs;
	var finished;
	var fieldSizeX;
	var fieldSizeY;
	var fieldLeft; // Horizontal offset of displayed field (as opposed to physical model field)
	var fieldTop; // Vertical offset of displayed field
	var squareWidth; // Width of a single displayed square
	var squareHeight; // Height of a single displayed square
	var numSquaresX; // Width of displayed field
	var numSquaresY; // Height of displayed field

	fieldSizeX = fSX;
	fieldSizeY = fSY
	fieldLeft = fL;
	fieldTop = fR;
	squareWidth = sW;
	squareHeight = sH;
	numSquaresX = nSX;
	numSquaresY = nSY;
	horizDivisor = numSquaresX/fieldSizeX; // How many physical field cells are there per displayed square horizontally?
	verticDivisor = numSquaresY/fieldSizeY; // How many physical field cells are there per displayed square vertically?

	// Create div-tags
	// Background color and any other attributes are dealt with by external CSS to give the user of this class
	// some control
	divs = new Array();
	for(var i=0; i<numSquaresX; i++)
	{
		divs[i] = new Array();
		for(var j=0; j<numSquaresY; j++)
		{
			divs[i][j] = document.createElement('div');
			divs[i][j].setAttribute('class', 'square');
			divs[i][j].setAttribute('className', 'square'); // IE uses className instead of class
			//divs[i][j].setAttribute('onmouseover', 'squareMouseOver('+i+','+j+');');
			
			// Each div will make a call to squareMouseOver with its own coordinates (in the divs array) as parameters
			var temp="squareMouseOver("+i+","+j+");";
			divs[i][j].onmouseover = new Function(temp);
			divs[i][j].style.left = i*squareWidth+fieldLeft + "px";
			divs[i][j].style.top = j*squareHeight+fieldTop + "px";
			document.body.appendChild(divs[i][j]);
		}
	}

	// Initialise physical field and tempField (for working calculations)
	field = new Array();
	tempField = new Array();
	for(var k=0; k<fieldSizeX; k++)
	{
		field[k] = new Array();
		tempField[k] = new Array();
	}

	// Populate physical field and tempField
	for(var i=0; i<fieldSizeX; i++)
	{
		for(var j=0; j<fieldSizeY; j++)
		{
			field[i][j] = new Particle(0, 0, 0);
			tempField[i][j] = new Particle(0, 0, 0);
		}
	}
	finished = true; // Use to ensure synchronicity (see moveDivs())
	self.setInterval(moveDivs, 10);

	this.squareMouseOver = function(i,j) {
		// Find out where I am
		var x = parseInt(divs[i][j].style.left)-fieldLeft;
		var y = parseInt(divs[i][j].style.top)-fieldTop;

		// Work out index of equivalent position in field
		var fx = Math.round(x/squareWidth);
		var fy = Math.round(y/squareHeight);
		field[fx][fy].setPressure(500);
	}

	// Process each cell in the physical field in order to update velocities and pressure based upon
	// those of its neighbours
	function update()
	{
		for(var i=1; i<fieldSizeX-1; i++)
		{
			for(var j=1; j<fieldSizeY-1; j++)
			{
				tempField[i][j] = processCell(i, j);
			}
		}
		field = tempField;
	}


	function processCell(i, j)
	{
		var xv;
		var yv;
		var xp;
		var yp;

		xv = field[i][j].getXVel() + (field[i-1][j-1].getPressure()*0.5 + field[i-1][j].getPressure() + field[i-1][j+1].getPressure()*0.5 - field[i+1][j-1].getPressure()*0.5 - field[i+1][j].getPressure() - field[i+1][j+1].getPressure()*0.5)*0.25;

		yv = field[i][j].getYVel() + (field[i-1][j-1].getPressure()*0.5 + field[i][j-1].getPressure() + field[i+1][j-1].getPressure()*0.5 - field[i-1][j+1].getPressure()*0.5 - field[i][j+1].getPressure() - field[i+1][j+1].getPressure()*0.5)*0.25;

		xp = field[i-1][j-1].getXVel()*0.5 + field[i-1][j].getXVel() + field[i-1][j+1].getXVel()*0.5 - field[i+1][j-1].getXVel()*0.5 - field[i+1][j].getXVel() - field[i+1][j+1].getXVel()*0.5;

		yp = field[i-1][j-1].getYVel()*0.5 + field[i][j-1].getYVel() + field[i+1][j-1].getYVel()*0.5 - field[i-1][j+1].getYVel()*0.5 - field[i][j+1].getYVel() - field[i+1][j+1].getYVel()*0.5;

		var pressure = (xp + yp)*0.25;

		return new Particle(xv, yv, pressure);
	}

	function moveDivs()
	{
		var sqx = 0;
		var sqy = 0;
		var tx = 0;
		var ty = 0;

		// This function should be synchronous - this isn't always the case with browsers
		// so we'll endeavour to ensure it here
		if (finished) {
			finished = false;
			update();

			for(var i=0; i<numSquaresX; i++) // faster if value of numSquaresX is hard-coded here but that would cause maintenance problems
			{
				for(var j=0; j<numSquaresY; j++) // faster if value of numSquaresY is hard-coded here but that would cause maintenance problems
				{	
					tx = parseInt(divs[i][j].style.left);
					ty = parseInt(divs[i][j].style.top);
					if (tx > fieldLeft && tx < fieldLeft + (numSquaresX*squareWidth) && ty > fieldTop && ty < fieldTop + (numSquaresY*squareHeight)) {
						sqx = Math.round(i/horizDivisor);
						sqy = Math.round(j/verticDivisor);
						divs[i][j].style.left = parseInt(divs[i][j].style.left) + Math.round(field[sqx][sqy].getXVel()/1) + "px";
						divs[i][j].style.top = parseInt(divs[i][j].style.top) + Math.round(field[sqx][sqy].getYVel()/1) + "px";
					}
				}
			}
			finished = true;
		}
	}
}

// Routes squareMouseOver call back into the Field object
// Might benefit from application of Visitor pattern
function squareMouseOver(i,j) {
	field.squareMouseOver(i,j);
}
