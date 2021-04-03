#include "utils.h"

float mod_2pi(float angle)
{
	while(angle > 2.f*PI)
	{
		angle -= 2.f * PI;
	}
	while(angle < 0.f)
	{
		angle += 2.f * PI;
	}
	return angle;
}