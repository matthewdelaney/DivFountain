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
 * Foobar is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with DivFountain.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * Filename: Particle.js
 * Purpose : A Particle class storing x-velocity, y-velocity and pressure
 * Date    : 1/7/2011
 * @author Matthew Delaney
 */
function Particle(xv, yv, p)
{
	this.xVel = xv;
	this.yVel = yv;
	this.pressure = p;

	this.getXVel = function() {
		return this.xVel;
	}

	this.setXVel = function(xv) {
		this.xVel = xv;
	}

	this.getYVel = function() {
		return this.yVel;
	}

	this.setYVel = function(yv) {
		this.yVel = yv;
	}

	this.getPressure = function() {
		return this.pressure;
	}

	this.setPressure = function(p) {
		this.pressure = p;
	}
}
