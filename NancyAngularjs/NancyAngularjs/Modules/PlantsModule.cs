using System;
using Nancy;
using Nancy.ModelBinding;
using NancyAngularjs.Models;

namespace NancyAngularjs.Modules
{
    public class PlantsModule : NancyModule
    {
        public PlantsModule(IService service)
        {
            Get["/plants/{Id}"] = parameters => Response.AsJson((PlantModel)service.GetById(parameters.Id));
            Get["/plants"] = parameters => Response.AsJson(service.GetAll());
            Put["/plants/{Id}"] = parameters =>
                {
                    var plant = this.Bind<PlantModel>();
                    service.Update(plant);
                    return Response.AsJson(plant);
                };
            Post["/plants"] = parameters =>
                {
                    var plant = this.Bind<PlantModel>();
                    service.Create(plant);
                    return Response.AsJson(plant);
            };
            Delete["/plants/{Id}"] = parameters =>
            {
                service.Delete(parameters.Id);
                return Response.AsJson(new { Result = "Ok Delete" });
            };
        }


    }
}