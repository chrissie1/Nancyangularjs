using System;
using System.Collections.Generic;
using System.Linq;
using NancyAngularjs.Models;

namespace NancyAngularjs.Modules
{
    public class Service:IService
    {
        private IList<PlantModel> plants;

        public Service()
        {
            if (plants == null) plants = MakePlants();
        }

        public IList<PlantModel> GetAll()
        {
            return plants;
        }

        public void Delete(int id)
        {
            plants.Remove(plants.SingleOrDefault(x => x.Id == id));
        }

        public void Create(PlantModel plant)
        {
            plants.Add(plant);
        }

        public void Update(PlantModel plant)
        {
            var plant1 = plants.SingleOrDefault(x => x.Id == plant.Id);
            plant1.Name = plant.Name;
            plant1.Genus = plant.Genus;
        }

        public PlantModel GetById(int id)
        {
            return plants.SingleOrDefault(x => x.Id == id);
        }

        private static IList<PlantModel> MakePlants()
        {
            var plantModels = new List<PlantModel>();
            for (var i = 1; i <= 25; i++)
            {
                var j = i.ToString("000");
                plantModels.Add(new PlantModel()
                    {
                        Id = i,
                        Name = "name" + j,
                        Genus = "genus" + j,
                        Species = "Species" + j,
                        DateAdded = DateTime.Now
                    });
            }
            return plantModels;
        }
    }
}