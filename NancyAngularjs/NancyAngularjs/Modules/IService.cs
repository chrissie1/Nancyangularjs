using System.Collections.Generic;
using NancyAngularjs.Models;

namespace NancyAngularjs.Modules
{
    public interface IService
    {
        IList<PlantModel> GetAll();
        void Delete(int id);
        void Create(PlantModel plant);
        void Update(PlantModel plant);
        PlantModel GetById(int id);
    }
}